from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.models.journey import Journey, Appointment, TravelArrangement
from backend.app.schemas.journey import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    TravelArrangementCreate,
    TravelArrangementResponse
)
from backend.app.services.conflict_detector import sync_journey_alerts
from backend.app.services.readiness_scorer import calculate_readiness_score

router = APIRouter(tags=["Appointments & Travel Coordination"])

@router.get("/journeys/{journey_id}/appointments", response_model=List[AppointmentResponse])
def get_appointments(
    journey_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    if current_user.role != "platform_admin" and journey.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    apts = db.query(Appointment).filter(Appointment.journey_id == journey_id).order_by(Appointment.start_time.asc()).all()
    return [AppointmentResponse.model_validate(a) for a in apts]

@router.post("/journeys/{journey_id}/appointments", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    journey_id: str,
    apt_in: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    if current_user.role != "platform_admin" and journey.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    apt = Appointment(
        journey_id=journey_id,
        hospital_id=apt_in.hospital_id,
        appointment_type=apt_in.appointment_type,
        start_time=apt_in.start_time,
        end_time=apt_in.end_time,
        location=apt_in.location,
        doctor_name=apt_in.doctor_name,
        department=apt_in.department,
        status="scheduled",
        is_teleconsult=apt_in.is_teleconsult,
        notes=apt_in.notes
    )
    db.add(apt)
    db.commit()
    db.refresh(apt)

    sync_journey_alerts(db, journey_id)
    calculate_readiness_score(db, journey_id)
    return AppointmentResponse.model_validate(apt)

@router.patch("/appointments/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: str,
    apt_in: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    for field, val in apt_in.model_dump(exclude_unset=True).items():
        setattr(apt, field, val)

    db.commit()
    sync_journey_alerts(db, apt.journey_id)
    calculate_readiness_score(db, apt.journey_id)
    db.refresh(apt)
    return AppointmentResponse.model_validate(apt)

@router.get("/journeys/{journey_id}/travel", response_model=List[TravelArrangementResponse])
def get_travel_arrangements(
    journey_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    if current_user.role != "platform_admin" and journey.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    travels = db.query(TravelArrangement).filter(TravelArrangement.journey_id == journey_id).order_by(TravelArrangement.start_time.asc()).all()
    return [TravelArrangementResponse.model_validate(t) for t in travels]

@router.post("/journeys/{journey_id}/travel", response_model=TravelArrangementResponse, status_code=status.HTTP_201_CREATED)
def create_travel_arrangement(
    journey_id: str,
    travel_in: TravelArrangementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    if current_user.role != "platform_admin" and journey.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    travel = TravelArrangement(
        journey_id=journey_id,
        arrangement_type=travel_in.arrangement_type,
        provider_name=travel_in.provider_name,
        confirmation_code=travel_in.confirmation_code,
        start_time=travel_in.start_time,
        end_time=travel_in.end_time,
        departure_location=travel_in.departure_location,
        arrival_location=travel_in.arrival_location,
        cost=travel_in.cost,
        currency=travel_in.currency,
        status=travel_in.status,
        notes=travel_in.notes
    )
    db.add(travel)
    db.commit()
    db.refresh(travel)

    sync_journey_alerts(db, journey_id)
    calculate_readiness_score(db, journey_id)
    return TravelArrangementResponse.model_validate(travel)
