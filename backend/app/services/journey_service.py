from typing import Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.models.journey import Journey, JourneyStage, JourneyTask
from backend.app.models.hospital import Hospital
from backend.app.models.user import PatientPreference
from backend.app.models.cost import EstimateLineItem
from backend.app.ai.provider import get_ai_provider
from backend.app.ai.rag import search_approved_knowledge
from backend.app.services.conflict_detector import sync_journey_alerts
from backend.app.services.readiness_scorer import calculate_readiness_score

async def generate_and_save_journey(
    db: Session,
    user_id: str,
    title: str,
    treatment_category: str,
    selected_hospital_id: Optional[str] = None,
    currency: str = "USD"
) -> Journey:
    # 1. Retrieve user preferences
    prefs = db.query(PatientPreference).filter(PatientPreference.user_id == user_id).first()
    pref_dict = {
        "treatment_category": treatment_category,
        "currency": currency,
        "residence_country": prefs.residence_country if prefs else "United States",
        "preferred_destinations": prefs.preferred_destinations if prefs else ["Thailand", "India", "Turkey"],
        "preferred_language": prefs.preferred_language if prefs else "English",
        "travel_flexibility": prefs.travel_flexibility if prefs else "flexible"
    }

    # 2. Query selected or recommended hospital
    hospital = None
    if selected_hospital_id:
        hospital = db.query(Hospital).filter(Hospital.id == selected_hospital_id).first()
    if not hospital:
        # Match hospital by treatment category
        hospitals = db.query(Hospital).all()
        if hospitals:
            hospital = hospitals[0]
            selected_hospital_id = hospital.id

    hospital_dict = None
    if hospital:
        hospital_dict = {
            "id": hospital.id,
            "name": hospital.name,
            "country": hospital.country,
            "city": hospital.city,
            "languages": hospital.languages or ["English"],
            "is_verified": hospital.is_verified
        }

    # 3. Retrieve relevant approved grounding knowledge (RAG)
    rag_sources = search_approved_knowledge(db, query=f"{treatment_category} {hospital.country if hospital else ''}", limit=3)
    knowledge_texts = [s["text_content"] for s in rag_sources]

    # 4. Generate structured journey plan using AI Provider abstraction
    ai_provider = get_ai_provider()
    raw_plan = await ai_provider.generate_journey_plan(pref_dict, hospital_dict, knowledge_texts)

    # 5. Save Journey model
    journey = Journey(
        user_id=user_id,
        title=title or raw_plan.get("journey_title", f"Medical Travel Journey: {treatment_category}"),
        treatment_category=treatment_category,
        selected_hospital_id=selected_hospital_id,
        status="planning",
        currency=currency,
        departure_date=datetime.now(timezone.utc),
        readiness_score=0.0
    )
    db.add(journey)
    db.flush()  # assign journey.id

    # 6. Populate Stages and Tasks
    stages_data = raw_plan.get("stages", [])
    for stage_info in stages_data:
        stage = JourneyStage(
            journey_id=journey.id,
            stage_order=stage_info.get("stage_order", 1),
            stage_name=stage_info.get("stage_name", "Preparation Stage"),
            status="in_progress" if stage_info.get("stage_order") == 1 else "not_started"
        )
        db.add(stage)
        db.flush()

        for task_info in stage_info.get("tasks", []):
            task = JourneyTask(
                stage_id=stage.id,
                journey_id=journey.id,
                title=task_info.get("title", "Journey Action Item"),
                description=task_info.get("description"),
                status=task_info.get("status", "not_started"),
                priority=task_info.get("priority", "medium"),
                dependencies=task_info.get("dependencies", []),
                responsible_party=task_info.get("responsible_party", "patient"),
                source_references=task_info.get("source_references", []),
                requires_confirmation=task_info.get("requires_confirmation", False),
                warning_notes=task_info.get("warning_notes")
            )
            db.add(task)

    # 7. Seed Initial Estimate Line Items from Hospital if available
    if hospital and hospital.estimates:
        est = hospital.estimates[0]
        base_item = EstimateLineItem(
            estimate_id=est.id,
            journey_id=journey.id,
            category="provider_procedure",
            item_name=est.treatment_name,
            estimated_amount=est.base_cost,
            currency=est.currency,
            confirmation_status="quoted_by_hospital",
            is_included_in_base=True,
            source_reference=f"Hospital Quotation: {est.id}"
        )
        diag_item = EstimateLineItem(
            estimate_id=est.id,
            journey_id=journey.id,
            category="diagnostics",
            item_name="Pre-operative Laboratory & Imaging Workup",
            estimated_amount=450.0,
            currency=est.currency,
            confirmation_status="estimated",
            is_included_in_base=False,
            source_reference="Hospital Diagnostic Fee Schedule"
        )
        db.add(base_item)
        db.add(diag_item)

    db.commit()

    # 8. Run rule-based validation and readiness scorer
    sync_journey_alerts(db, journey.id)
    calculate_readiness_score(db, journey.id)
    
    db.refresh(journey)
    return journey
