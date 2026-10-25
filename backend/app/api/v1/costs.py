from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.models.journey import Journey
from backend.app.models.cost import EstimateLineItem
from backend.app.schemas.cost import (
    CostBreakdownResponse,
    CostCompareResponse,
    EstimateLineItemCreate,
    EstimateLineItemResponse
)
from backend.app.services.cost_service import get_journey_cost_breakdown, compare_treatment_costs
from backend.app.services.readiness_scorer import calculate_readiness_score

router = APIRouter(tags=["Cost Intelligence"])

@router.get("/journeys/{journey_id}/costs", response_model=CostBreakdownResponse)
def get_costs(
    journey_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    if current_user.role != "platform_admin" and journey.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    return get_journey_cost_breakdown(db, journey_id)

@router.post("/costs/compare", response_model=CostCompareResponse)
def compare_costs(
    treatment_category: str = "Cardiology",
    currency: str = "USD",
    db: Session = Depends(get_db)
):
    return compare_treatment_costs(db, treatment_category, currency)

@router.post("/journeys/{journey_id}/costs/line-item", response_model=EstimateLineItemResponse)
def add_cost_item(
    journey_id: str,
    item_in: EstimateLineItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    if current_user.role != "platform_admin" and journey.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    item = EstimateLineItem(
        journey_id=journey_id,
        category=item_in.category,
        item_name=item_in.item_name,
        estimated_amount=item_in.estimated_amount,
        currency=item_in.currency,
        confirmation_status=item_in.confirmation_status,
        is_included_in_base=item_in.is_included_in_base,
        notes=item_in.notes
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    calculate_readiness_score(db, journey_id)
    return EstimateLineItemResponse.model_validate(item)
