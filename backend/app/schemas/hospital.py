from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class HospitalServiceResponse(BaseModel):
    id: str
    category: str
    service_name: str
    description: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

class HospitalCredentialResponse(BaseModel):
    id: str
    title: str
    issuer: str
    issue_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    credential_type: str
    verification_status: str
    verified_at: Optional[datetime] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class TreatmentEstimateSummary(BaseModel):
    id: str
    treatment_category: str
    treatment_name: str
    currency: str
    base_cost: float
    min_cost: float
    max_cost: float
    inclusions: List[str] = []
    exclusions: List[str] = []
    is_published: bool

    class Config:
        from_attributes = True

class HospitalResponse(BaseModel):
    id: str
    name: str
    country: str
    city: str
    address: Optional[str] = None
    website: Optional[str] = None
    description: str
    logo_url: Optional[str] = None
    rating_score: float
    is_verified: bool
    verification_date: Optional[datetime] = None
    verified_by: Optional[str] = None
    verification_notes: Optional[str] = None
    is_demo_data: bool
    languages: List[str] = []
    contact_email: str
    phone: Optional[str] = None
    created_at: datetime
    services: List[HospitalServiceResponse] = []
    credentials: List[HospitalCredentialResponse] = []
    estimates: List[TreatmentEstimateSummary] = []

    class Config:
        from_attributes = True

class HospitalVerificationUpdate(BaseModel):
    is_verified: bool
    verification_notes: Optional[str] = None
