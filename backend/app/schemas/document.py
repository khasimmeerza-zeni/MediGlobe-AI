from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class DocumentResponse(BaseModel):
    id: str
    user_id: str
    journey_id: Optional[str] = None
    filename: str
    original_name: str
    file_size: int
    mime_type: str
    category: str
    is_sensitive: bool
    ai_summary: Optional[str] = None
    extracted_metadata: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentPermissionCreate(BaseModel):
    document_id: str
    granted_to_user_id: Optional[str] = None
    granted_to_hospital_id: Optional[str] = None
    permission_type: str = "view"
    expires_in_days: int = 30

class DocumentPermissionResponse(BaseModel):
    id: str
    document_id: str
    granted_to_user_id: Optional[str] = None
    granted_to_hospital_id: Optional[str] = None
    permission_type: str
    expires_at: Optional[datetime] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ConsentCreate(BaseModel):
    consent_type: str  # data_processing, ai_analysis, hospital_sharing
    is_granted: bool

class ConsentResponse(BaseModel):
    id: str
    user_id: str
    consent_type: str
    is_granted: bool
    granted_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
