from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class JourneyTaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "not_started"
    priority: str = "medium"
    dependencies: List[str] = []
    due_date: Optional[datetime] = None
    responsible_party: str = "patient"
    source_references: List[str] = []
    requires_confirmation: bool = False
    warning_notes: Optional[str] = None

class JourneyTaskCreate(JourneyTaskBase):
    stage_id: str

class JourneyTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    responsible_party: Optional[str] = None
    warning_notes: Optional[str] = None

class JourneyTaskResponse(JourneyTaskBase):
    id: str
    stage_id: str
    journey_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class JourneyStageResponse(BaseModel):
    id: str
    journey_id: str
    stage_order: int
    stage_name: str
    status: str
    tasks: List[JourneyTaskResponse] = []

    class Config:
        from_attributes = True

class JourneyCreate(BaseModel):
    title: str
    treatment_category: str
    selected_hospital_id: Optional[str] = None
    departure_date: Optional[datetime] = None
    return_date: Optional[datetime] = None
    currency: str = "USD"

class JourneyUpdate(BaseModel):
    title: Optional[str] = None
    selected_hospital_id: Optional[str] = None
    status: Optional[str] = None
    departure_date: Optional[datetime] = None
    return_date: Optional[datetime] = None
    currency: Optional[str] = None

class JourneyResponse(BaseModel):
    id: str
    user_id: str
    title: str
    treatment_category: str
    selected_hospital_id: Optional[str] = None
    status: str
    readiness_score: float
    readiness_breakdown: Dict[str, Any] = {}
    departure_date: Optional[datetime] = None
    return_date: Optional[datetime] = None
    currency: str
    total_estimated_cost: float
    created_at: datetime
    updated_at: datetime
    stages: List[JourneyStageResponse] = []

    class Config:
        from_attributes = True

class AppointmentCreate(BaseModel):
    journey_id: str
    hospital_id: Optional[str] = None
    appointment_type: str
    start_time: datetime
    end_time: datetime
    location: str
    doctor_name: Optional[str] = None
    department: Optional[str] = None
    is_teleconsult: bool = False
    notes: Optional[str] = None

class AppointmentUpdate(BaseModel):
    appointment_type: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    doctor_name: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: str
    journey_id: str
    hospital_id: Optional[str] = None
    appointment_type: str
    start_time: datetime
    end_time: datetime
    location: str
    doctor_name: Optional[str] = None
    department: Optional[str] = None
    status: str
    is_teleconsult: bool
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TravelArrangementCreate(BaseModel):
    journey_id: str
    arrangement_type: str
    provider_name: str
    confirmation_code: Optional[str] = None
    start_time: datetime
    end_time: datetime
    departure_location: Optional[str] = None
    arrival_location: Optional[str] = None
    cost: float = 0.0
    currency: str = "USD"
    status: str = "tentative"
    notes: Optional[str] = None

class TravelArrangementResponse(BaseModel):
    id: str
    journey_id: str
    arrangement_type: str
    provider_name: str
    confirmation_code: Optional[str] = None
    start_time: datetime
    end_time: datetime
    departure_location: Optional[str] = None
    arrival_location: Optional[str] = None
    cost: float
    currency: str
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
