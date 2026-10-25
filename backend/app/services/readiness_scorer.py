from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models.journey import Journey, Appointment, TravelArrangement, JourneyTask
from backend.app.models.cost import EstimateLineItem
from backend.app.models.document import Document
from backend.app.models.hospital import Hospital

def calculate_readiness_score(db: Session, journey_id: str) -> Dict[str, Any]:
    """
    Transparently calculates the Journey Readiness Score (0 to 100) based strictly on logistical milestones.
    Explicitly NOT a medical or clinical assessment.
    """
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if not journey:
        return {"score": 0.0, "grade": "Not Found", "metrics": []}

    appointments = db.query(Appointment).filter(Appointment.journey_id == journey_id).all()
    travels = db.query(TravelArrangement).filter(TravelArrangement.journey_id == journey_id).all()
    tasks = db.query(JourneyTask).filter(JourneyTask.journey_id == journey_id).all()
    line_items = db.query(EstimateLineItem).filter(EstimateLineItem.journey_id == journey_id).all()
    documents = db.query(Document).filter(Document.journey_id == journey_id).all()
    
    doc_categories = {d.category for d in documents}
    has_passport = "passport" in doc_categories
    has_visa_or_docs = "visa" in doc_categories or "medical_record" in doc_categories

    # 1. Identity & Travel Documents (Max 20)
    score_docs = 0.0
    if has_passport:
        score_docs += 10.0
    if has_visa_or_docs:
        score_docs += 10.0
    metric_docs = {
        "category": "Identity & Administrative Documents",
        "weight": 20,
        "score": score_docs,
        "max_score": 20,
        "status": "complete" if score_docs >= 20 else ("partial" if score_docs > 0 else "missing"),
        "details": f"{'Passport verified (+10)' if has_passport else 'Passport missing (0)'}; {'Medical/Visa documentation attached (+10)' if has_visa_or_docs else 'Visa/Clinical documentation missing (0)'}."
    }

    # 2. Hospital & Consultation Alignment (Max 25)
    score_hosp = 0.0
    hosp_selected = journey.selected_hospital_id is not None
    if hosp_selected:
        score_hosp += 10.0
        hospital = db.query(Hospital).filter(Hospital.id == journey.selected_hospital_id).first()
        if hospital and hospital.is_verified:
            score_hosp += 5.0
    
    has_consult = any(a.is_teleconsult or "consult" in a.appointment_type.lower() for a in appointments)
    if has_consult:
        score_hosp += 10.0
        
    metric_hosp = {
        "category": "Hospital Selection & Consultation",
        "weight": 25,
        "score": score_hosp,
        "max_score": 25,
        "status": "complete" if score_hosp >= 25 else ("partial" if score_hosp > 0 else "missing"),
        "details": f"{'Hospital confirmed (+10)' if hosp_selected else 'No hospital selected (0)'}; {'Accreditation verified (+5)' if score_hosp >= 15 else 'Unverified/Pending accreditation (0)'}; {'Consultation coordinated (+10)' if has_consult else 'Consultation not yet scheduled (0)'}."
    }

    # 3. Treatment Cost Transparency (Max 20)
    score_cost = 0.0
    if line_items:
        score_cost += 10.0
        # Check if procedure and accommodation/diagnostics exist
        cats = {item.category for item in line_items}
        if len(cats) >= 3:
            score_cost += 5.0
        if any(item.confirmation_status in ["confirmed", "quoted_by_hospital"] for item in line_items):
            score_cost += 5.0
            
    metric_cost = {
        "category": "Cost & Budget Quotation",
        "weight": 20,
        "score": score_cost,
        "max_score": 20,
        "status": "complete" if score_cost >= 20 else ("partial" if score_cost > 0 else "missing"),
        "details": f"{'Cost ledger established (+10)' if line_items else 'No cost ledger (0)'}; {'Multiple cost categories mapped (+5)' if score_cost >= 15 else 'Limited expense categories (0)'}; {'Provider quotation confirmed (+5)' if score_cost == 20 else 'Awaiting quote confirmation (0)'}."
    }

    # 4. Travel & Lodging Synchronization (Max 20)
    score_travel = 0.0
    has_flight = any(t.arrangement_type == "flight" for t in travels)
    has_hotel = any(t.arrangement_type == "hotel" for t in travels)
    if has_flight:
        score_travel += 10.0
    if has_hotel:
        score_travel += 10.0
        
    metric_travel = {
        "category": "Travel & Accommodation Arrangements",
        "weight": 20,
        "score": score_travel,
        "max_score": 20,
        "status": "complete" if score_travel >= 20 else ("partial" if score_travel > 0 else "missing"),
        "details": f"{'Inbound/outbound flights arranged (+10)' if has_flight else 'Flights missing (0)'}; {'Medical recovery lodging booked (+10)' if has_hotel else 'Lodging not booked (0)'}."
    }

    # 5. Post-Treatment Continuity (Max 15)
    score_followup = 0.0
    has_followup_apt = any("follow_up" in a.appointment_type.lower() or "post" in a.appointment_type.lower() for a in appointments)
    if has_followup_apt:
        score_followup += 10.0
        
    followup_task_complete = any("post-treatment" in t.title.lower() and t.status in ["completed", "in_progress"] for t in tasks)
    if followup_task_complete or score_followup > 0:
        score_followup = min(15.0, score_followup + 5.0)

    metric_followup = {
        "category": "Post-Treatment Care Coordination",
        "weight": 15,
        "score": score_followup,
        "max_score": 15,
        "status": "complete" if score_followup >= 15 else ("partial" if score_followup > 0 else "missing"),
        "details": f"{'Post-op follow-up consultation scheduled (+10)' if has_followup_apt else 'Follow-up appointment not in schedule (0)'}; {'Home physician continuity plan initiated (+5)' if score_followup >= 15 else 'Local continuity unconfirmed (0)'}."
    }

    total_score = round(score_docs + score_hosp + score_cost + score_travel + score_followup, 1)

    if total_score >= 85:
        grade = "High Logistics Readiness"
    elif total_score >= 50:
        grade = "Moderate Readiness (Action Items Pending)"
    else:
        grade = "Incomplete Arrangements"

    # Update on journey record
    journey.readiness_score = total_score
    journey.readiness_breakdown = {
        "score": total_score,
        "grade": grade,
        "metrics": [metric_docs, metric_hosp, metric_cost, metric_travel, metric_followup]
    }
    db.commit()

    return {
        "score": total_score,
        "grade": grade,
        "metrics": [metric_docs, metric_hosp, metric_cost, metric_travel, metric_followup]
    }
