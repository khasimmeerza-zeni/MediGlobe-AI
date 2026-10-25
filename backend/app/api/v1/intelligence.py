from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.models.journey import Journey
from backend.app.models.audit import JourneyAlert
from backend.app.schemas.intelligence import JourneyAlertResponse, JourneyValidationResult, ReadinessMetric
from backend.app.services.conflict_detector import sync_journey_alerts
from backend.app.services.readiness_scorer import calculate_readiness_score
from backend.app.ai.provider import get_ai_provider

router = APIRouter(tags=["Journey Intelligence Centre"])

@router.get("/journeys/{journey_id}/alerts", response_model=List[JourneyAlertResponse])
def get_alerts(
    journey_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")

    alerts = db.query(JourneyAlert).filter(JourneyAlert.journey_id == journey_id).all()
    return [JourneyAlertResponse.model_validate(a) for a in alerts]

@router.post("/journeys/{journey_id}/validate", response_model=JourneyValidationResult)
async def validate_journey_intelligence(
    journey_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")

    # 1. Run deterministic conflict engine
    alerts = sync_journey_alerts(db, journey_id)

    # 2. Run transparent readiness scorer
    readiness = calculate_readiness_score(db, journey_id)

    # 3. AI Plain-Language Explanation of Detected Issues
    ai_provider = get_ai_provider()
    conflict_payload = [
        {
            "severity": a.severity,
            "description": a.description,
            "suggested_action": a.suggested_action
        } for a in alerts
    ]
    ai_summary = await ai_provider.explain_journey_conflicts(conflict_payload)

    crit_count = sum(1 for a in alerts if a.severity == "critical")
    warn_count = sum(1 for a in alerts if a.severity == "warning")
    info_count = sum(1 for a in alerts if a.severity == "info")

    metrics_objs = [
        ReadinessMetric(
            category=m["category"],
            weight=m["weight"],
            score=m["score"],
            max_score=m["max_score"],
            status=m["status"],
            details=m["details"]
        ) for m in readiness.get("metrics", [])
    ]

    return JourneyValidationResult(
        journey_id=journey_id,
        readiness_score=readiness["score"],
        score_grade=readiness["grade"],
        metrics_breakdown=metrics_objs,
        total_alerts=len(alerts),
        critical_count=crit_count,
        warning_count=warn_count,
        info_count=info_count,
        alerts=[JourneyAlertResponse.model_validate(a) for a in alerts],
        ai_executive_summary=ai_summary,
        disclaimer="Journey Readiness Score is an administrative logistical checklist indicator. It does NOT evaluate clinical suitability or treatment outcomes."
    )

@router.patch("/alerts/{alert_id}/resolve")
def resolve_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(JourneyAlert).filter(JourneyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_resolved = True
    db.commit()
    return {"message": "Alert marked as resolved."}
