from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.models.journey import Journey, JourneyTask, JourneyStage
from backend.app.schemas.journey import JourneyTaskCreate, JourneyTaskUpdate, JourneyTaskResponse
from backend.app.services.conflict_detector import sync_journey_alerts
from backend.app.services.readiness_scorer import calculate_readiness_score

router = APIRouter(tags=["Tasks"])

@router.get("/journeys/{journey_id}/tasks", response_model=List[JourneyTaskResponse])
def get_journey_tasks(
    journey_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    if current_user.role != "platform_admin" and journey.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    tasks = db.query(JourneyTask).filter(JourneyTask.journey_id == journey_id).all()
    return [JourneyTaskResponse.model_validate(t) for t in tasks]

@router.post("/journeys/{journey_id}/tasks", response_model=JourneyTaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    journey_id: str,
    task_in: JourneyTaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    if current_user.role != "platform_admin" and journey.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    stage = db.query(JourneyStage).filter(JourneyStage.id == task_in.stage_id).first()
    if not stage:
        raise HTTPException(status_code=400, detail="Specified stage does not exist")

    task = JourneyTask(
        journey_id=journey_id,
        stage_id=task_in.stage_id,
        title=task_in.title,
        description=task_in.description,
        status=task_in.status,
        priority=task_in.priority,
        dependencies=task_in.dependencies,
        due_date=task_in.due_date,
        responsible_party=task_in.responsible_party,
        source_references=task_in.source_references,
        requires_confirmation=task_in.requires_confirmation,
        warning_notes=task_in.warning_notes
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    sync_journey_alerts(db, journey.id)
    calculate_readiness_score(db, journey.id)
    return JourneyTaskResponse.model_validate(task)

@router.patch("/tasks/{task_id}", response_model=JourneyTaskResponse)
def update_task_status(
    task_id: str,
    task_in: JourneyTaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(JourneyTask).filter(JourneyTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    journey = db.query(Journey).filter(Journey.id == task.journey_id).first()
    if journey and current_user.role != "platform_admin" and journey.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    for field, val in task_in.model_dump(exclude_unset=True).items():
        setattr(task, field, val)

    db.commit()
    if journey:
        sync_journey_alerts(db, journey.id)
        calculate_readiness_score(db, journey.id)

    db.refresh(task)
    return JourneyTaskResponse.model_validate(task)
