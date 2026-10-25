from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "patient"  # patient, hospital_admin, platform_admin

class UserCreate(UserBase):
    password: str
    hospital_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    hospital_id: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None


class PatientPreferenceBase(BaseModel):
    residence_country: str
    preferred_destinations: List[str] = []
    treatment_category: str
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    currency: str = "USD"
    preferred_language: str = "English"
    travel_flexibility: str = "flexible"
    approximate_travel_date: Optional[str] = None
    accessibility_needs: Optional[str] = None
    help_with_docs: bool = True

class PatientPreferenceCreate(PatientPreferenceBase):
    pass

class PatientPreferenceResponse(PatientPreferenceBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True
