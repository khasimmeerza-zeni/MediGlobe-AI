from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.models.journey import Journey
from backend.app.schemas.journey import JourneyCreate, JourneyUpdate, JourneyResponse
from backend.app.services.journey_service import generate_and_save_journey
from backend.app.services.readiness_scorer import calculate_readiness_score
from backend.app.services.conflict_detector import sync_journey_alerts

router = APIRouter(prefix="/journeys", tags=["Journeys"])

def verify_journey_owner(journey: Journey, current_user: User):
    # Patients can only access their own journeys. Platform admins can view any.
    if current_user.role == "platform_admin":
        return
    if current_user.role == "hospital_admin" and journey.selected_hospital_id == current_user.hospital_id:
        return
    if journey.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not have permission to view or modify this journey."
        )

@router.post("", response_model=JourneyResponse, status_code=status.HTTP_201_CREATED)
async def create_journey(
    journey_in: JourneyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    journey = await generate_and_save_journey(
        db=db,
        user_id=current_user.id,
        title=journey_in.title,
        treatment_category=journey_in.treatment_category,
        selected_hospital_id=journey_in.selected_hospital_id,
        currency=journey_in.currency
    )
    return JourneyResponse.model_validate(journey)

@router.get("", response_model=List[JourneyResponse])
def get_user_journeys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "platform_admin":
        journeys = db.query(Journey).all()
    elif current_user.role == "hospital_admin" and current_user.hospital_id:
        journeys = db.query(Journey).filter(Journey.selected_hospital_id == current_user.hospital_id).all()
    else:
        journeys = db.query(Journey).filter(Journey.user_id == current_user.id).all()
        
    return [JourneyResponse.model_validate(j) for j in journeys]

@router.get("/{journey_id}", response_model=JourneyResponse)
def get_journey_by_id(
    journey_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    verify_journey_owner(journey, current_user)
    return JourneyResponse.model_validate(journey)

@router.patch("/{journey_id}", response_model=JourneyResponse)
def update_journey(
    journey_id: str,
    journey_in: JourneyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    verify_journey_owner(journey, current_user)

    for field, val in journey_in.model_dump(exclude_unset=True).items():
        setattr(journey, field, val)

    db.commit()
    sync_journey_alerts(db, journey.id)
    calculate_readiness_score(db, journey.id)
    db.refresh(journey)
    return JourneyResponse.model_validate(journey)

@router.post("/{journey_id}/generate-plan", response_model=JourneyResponse)
async def regenerate_journey_plan(
    journey_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    verify_journey_owner(journey, current_user)

    # Delete existing stages and regenerate
    # Re-call generator
    new_journey = await generate_and_save_journey(
        db=db,
        user_id=current_user.id,
        title=journey.title,
        treatment_category=journey.treatment_category,
        selected_hospital_id=journey.selected_hospital_id,
        currency=journey.currency
    )
    return JourneyResponse.model_validate(new_journey)
