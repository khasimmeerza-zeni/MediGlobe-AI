import os
import uuid
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.models.document import Document, DocumentPermission, Consent
from backend.app.models.audit import AuditLog
from backend.app.schemas.document import (
    DocumentResponse,
    DocumentPermissionCreate,
    DocumentPermissionResponse,
    ConsentCreate,
    ConsentResponse
)
from backend.app.ai.provider import get_ai_provider

router = APIRouter(tags=["Documents & Privacy"])

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@router.post("/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    category: str = Form("other"),
    journey_id: Optional[str] = Form(None),
    is_sensitive: bool = Form(True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Validate File Extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # 2. Read and Validate Size
    contents = await file.read()
    file_size = len(contents)
    if file_size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size ({settings.MAX_UPLOAD_SIZE_MB} MB)"
        )

    # 3. Save to Private Storage
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    # 4. Optional AI Analysis & Extraction
    ai_summary = None
    ai_metadata = {}
    try:
        ai_provider = get_ai_provider()
        doc_analysis = await ai_provider.summarize_document(file.filename, category)
        ai_summary = doc_analysis.get("summary")
        ai_metadata = doc_analysis.get("ai_extracted_fields", {})
    except Exception:
        pass

    # 5. Save Record
    document = Document(
        user_id=current_user.id,
        journey_id=journey_id,
        filename=unique_filename,
        original_name=file.filename,
        file_size=file_size,
        mime_type=file.content_type or "application/octet-stream",
        file_path=file_path,
        category=category,
        is_sensitive=is_sensitive,
        ai_summary=ai_summary,
        extracted_metadata=ai_metadata,
        ai_processed_at=datetime.now(timezone.utc) if ai_summary else None
    )
    db.add(document)
    db.flush()

    # 6. Audit Logging
    client_ip = request.client.host if request.client else "unknown"
    audit = AuditLog(
        user_id=current_user.id,
        action="upload_document",
        resource_type="document",
        resource_id=document.id,
        details={"original_name": file.filename, "category": category, "file_size": file_size},
        ip_address=client_ip
    )
    db.add(audit)
    db.commit()
    db.refresh(document)

    return DocumentResponse.model_validate(document)

@router.get("/documents", response_model=List[DocumentResponse])
def get_user_documents(
    journey_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Document)
    if current_user.role == "platform_admin":
        pass  # Platform admin oversight
    elif current_user.role == "hospital_admin" and current_user.hospital_id:
        # Hospital admins can only see documents explicitly shared with their hospital!
        shared_doc_ids = db.query(DocumentPermission.document_id).filter(
            DocumentPermission.granted_to_hospital_id == current_user.hospital_id,
            DocumentPermission.is_active == True
        ).all()
        doc_ids = [d[0] for d in shared_doc_ids]
        query = query.filter(Document.id.in_(doc_ids))
    else:
        # Patient only sees their own documents
        query = query.filter(Document.user_id == current_user.id)

    if journey_id:
        query = query.filter(Document.journey_id == journey_id)

    docs = query.order_by(Document.created_at.desc()).all()
    return [DocumentResponse.model_validate(d) for d in docs]

@router.get("/documents/{document_id}/download")
def download_document(
    document_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check permission
    has_access = False
    if current_user.role == "platform_admin" or doc.user_id == current_user.id:
        has_access = True
    elif current_user.role == "hospital_admin" and current_user.hospital_id:
        perm = db.query(DocumentPermission).filter(
            DocumentPermission.document_id == doc.id,
            DocumentPermission.granted_to_hospital_id == current_user.hospital_id,
            DocumentPermission.is_active == True
        ).first()
        if perm:
            has_access = True

    if not has_access:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access this document")

    # Audit download
    client_ip = request.client.host if request.client else "unknown"
    audit = AuditLog(
        user_id=current_user.id,
        action="download_document",
        resource_type="document",
        resource_id=doc.id,
        details={"filename": doc.original_name},
        ip_address=client_ip
    )
    db.add(audit)
    db.commit()

    if not os.path.exists(doc.file_path):
        # In mock / demo, return mock bytes if local file doesn't exist on disk
        from io import BytesIO
        from fastapi.responses import StreamingResponse
        content = f"MediGlobe AI Secure Document: {doc.original_name}\nCategory: {doc.category}\nOwner ID: {doc.user_id}".encode()
        return StreamingResponse(BytesIO(content), media_type=doc.mime_type, headers={"Content-Disposition": f"attachment; filename={doc.original_name}"})

    return FileResponse(doc.file_path, filename=doc.original_name, media_type=doc.mime_type)

@router.delete("/documents/{document_id}")
def delete_document(
    document_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if current_user.role != "platform_admin" and doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    client_ip = request.client.host if request.client else "unknown"
    audit = AuditLog(
        user_id=current_user.id,
        action="delete_document",
        resource_type="document",
        resource_id=doc.id,
        details={"original_name": doc.original_name},
        ip_address=client_ip
    )
    db.add(audit)

    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"message": "Document permanently and securely deleted."}

@router.post("/documents/{document_id}/share", response_model=DocumentPermissionResponse)
def share_document(
    document_id: str,
    share_in: DocumentPermissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if current_user.role != "platform_admin" and doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    expires_at = datetime.now(timezone.utc) + timedelta(days=share_in.expires_in_days)
    perm = DocumentPermission(
        document_id=doc.id,
        granted_to_user_id=share_in.granted_to_user_id,
        granted_to_hospital_id=share_in.granted_to_hospital_id,
        permission_type=share_in.permission_type,
        expires_at=expires_at,
        is_active=True
    )
    db.add(perm)
    db.commit()
    db.refresh(perm)
    return DocumentPermissionResponse.model_validate(perm)

@router.delete("/documents/{document_id}/share/{permission_id}")
def revoke_document_share(
    document_id: str,
    permission_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    perm = db.query(DocumentPermission).filter(
        DocumentPermission.id == permission_id,
        DocumentPermission.document_id == document_id
    ).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permission grant not found")

    doc = db.query(Document).filter(Document.id == document_id).first()
    if doc and current_user.role != "platform_admin" and doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    perm.is_active = False
    perm.revoked_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Document access permission revoked successfully."}

@router.post("/consents", response_model=ConsentResponse)
def record_consent(
    consent_in: ConsentCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else "unknown"
    consent = db.query(Consent).filter(
        Consent.user_id == current_user.id,
        Consent.consent_type == consent_in.consent_type
    ).first()

    now = datetime.now(timezone.utc)
    if not consent:
        consent = Consent(
            user_id=current_user.id,
            consent_type=consent_in.consent_type,
            is_granted=consent_in.is_granted,
            granted_at=now if consent_in.is_granted else None,
            ip_address=client_ip
        )
        db.add(consent)
    else:
        consent.is_granted = consent_in.is_granted
        if consent_in.is_granted:
            consent.granted_at = now
            consent.revoked_at = None
        else:
            consent.revoked_at = now

    db.commit()
    db.refresh(consent)
    return ConsentResponse.model_validate(consent)

@router.get("/consents", response_model=List[ConsentResponse])
def get_user_consents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consents = db.query(Consent).filter(Consent.user_id == current_user.id).all()
    return [ConsentResponse.model_validate(c) for c in consents]
