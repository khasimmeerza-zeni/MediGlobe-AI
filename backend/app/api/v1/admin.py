from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import require_roles, get_current_user
from backend.app.models.user import User
from backend.app.models.hospital import Hospital, HospitalCredential
from backend.app.models.audit import AuditLog
from backend.app.schemas.hospital import HospitalResponse, HospitalVerificationUpdate
from backend.app.seed import seed_database

router = APIRouter(prefix="/admin", tags=["Administration & Hospital Portals"])

@router.get("/hospitals/pending-verification", response_model=List[HospitalResponse])
def get_pending_hospitals(
    current_user: User = Depends(require_roles(["platform_admin"])),
    db: Session = Depends(get_db)
):
    hospitals = db.query(Hospital).filter(Hospital.is_verified == False).all()
    return [HospitalResponse.model_validate(h) for h in hospitals]

@router.patch("/hospitals/{hospital_id}/verification", response_model=HospitalResponse)
def update_hospital_verification(
    hospital_id: str,
    update_in: HospitalVerificationUpdate,
    current_user: User = Depends(require_roles(["platform_admin"])),
    db: Session = Depends(get_db)
):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    hospital.is_verified = update_in.is_verified
    hospital.verification_notes = update_in.verification_notes
    if update_in.is_verified:
        hospital.verification_date = datetime.now(timezone.utc)
        hospital.verified_by = current_user.full_name
    else:
        hospital.verification_date = None
        hospital.verified_by = None

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="update_hospital_verification",
        resource_type="hospital",
        resource_id=hospital.id,
        details={"is_verified": update_in.is_verified, "notes": update_in.verification_notes}
    )
    db.add(audit)
    db.commit()
    db.refresh(hospital)
    return HospitalResponse.model_validate(hospital)

@router.get("/audit-logs")
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_roles(["platform_admin"])),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "details": l.details,
            "ip_address": l.ip_address,
            "timestamp": l.timestamp.isoformat()
        } for l in logs
    ]

@router.post("/demo-data/reset")
def reset_demo_data(
    current_user: User = Depends(require_roles(["platform_admin"])),
    db: Session = Depends(get_db)
):
    # Clear and re-run seed
    from backend.app.models import Base
    from backend.app.core.database import engine
    Base.metadata.drop_all(bind=engine)
    seed_database()
    return {"message": "Demonstration database successfully re-initialized with sample data."}
