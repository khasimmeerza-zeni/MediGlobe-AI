from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from backend.app.models.journey import Journey, Appointment, TravelArrangement, JourneyTask
from backend.app.models.cost import EstimateLineItem
from backend.app.models.document import Document
from backend.app.models.hospital import Hospital, HospitalCredential
from backend.app.models.audit import JourneyAlert

def detect_journey_conflicts(db: Session, journey_id: str) -> List[Dict[str, Any]]:
    """
    Deterministic rule engine that detects logistical, timing, and administrative discrepancies.
    Does not rely on hallucinated AI assumptions; checks real records.
    """
    conflicts: List[Dict[str, Any]] = []
    
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if not journey:
        return conflicts

    appointments = db.query(Appointment).filter(Appointment.journey_id == journey_id).all()
    travels = db.query(TravelArrangement).filter(TravelArrangement.journey_id == journey_id).all()
    tasks = db.query(JourneyTask).filter(JourneyTask.journey_id == journey_id).all()
    line_items = db.query(EstimateLineItem).filter(EstimateLineItem.journey_id == journey_id).all()
    documents = db.query(Document).filter(Document.journey_id == journey_id).all()
    
    # 1. Rule: Transport and Hospital Appointment Overlap
    # A patient cannot be on an airport transfer or flight while an in-person hospital appointment is scheduled.
    for apt in appointments:
        for trv in travels:
            if trv.arrangement_type in ["flight", "transfer"]:
                # Check overlap: (StartA <= EndB) and (EndA >= StartB)
                if (apt.start_time <= trv.end_time) and (apt.end_time >= trv.start_time):
                    conflicts.append({
                        "severity": "critical",
                        "alert_type": "overlap",
                        "description": f"Schedule conflict: '{apt.appointment_type}' overlaps with '{trv.provider_name}' {trv.arrangement_type}.",
                        "detected_reason": f"Appointment window ({apt.start_time.strftime('%b %d, %H:%M')} - {apt.end_time.strftime('%H:%M')}) collides with travel arrangement ({trv.start_time.strftime('%b %d, %H:%M')} - {trv.end_time.strftime('%H:%M')}).",
                        "suggested_action": "Reschedule the airport transfer or shift the in-hospital consultation time slot.",
                        "requires_human_action": True,
                        "task_id": None
                    })

    # 2. Rule: Accommodation Ends Before Final Hospital Follow-up
    # Patient must have lodging through the entire post-op follow-up period.
    hotels = [t for t in travels if t.arrangement_type == "hotel"]
    follow_ups = [a for a in appointments if "follow_up" in a.appointment_type.lower() or "post" in a.appointment_type.lower()]
    
    if hotels and follow_ups:
        latest_hotel_checkout = max(h.end_time for h in hotels)
        latest_followup = max(f.end_time for f in follow_ups)
        if latest_hotel_checkout < latest_followup:
            conflicts.append({
                "severity": "critical",
                "alert_type": "date_conflict",
                "description": "Accommodation check-out precedes final post-procedure follow-up appointment.",
                "detected_reason": f"Hotel reservation ends on {latest_hotel_checkout.strftime('%b %d')}, but follow-up consultation is scheduled on {latest_followup.strftime('%b %d')}.",
                "suggested_action": "Extend hotel stay by at least 1-2 days to cover post-op clinical evaluation before travel departure.",
                "requires_human_action": True,
                "task_id": None
            })
    elif follow_ups and not hotels:
        conflicts.append({
            "severity": "warning",
            "alert_type": "missing_confirmation",
            "description": "Follow-up consultation is scheduled but no verified recovery accommodation is booked.",
            "detected_reason": "No hotel or recovery lodge arrangement is associated with this journey.",
            "suggested_action": "Reserve medical-recovery lodging adjacent to the hospital.",
            "requires_human_action": True,
            "task_id": None
        })

    # 3. Rule: Unconfirmed or Missing Hospital Treatment Estimate
    if not line_items:
        conflicts.append({
            "severity": "warning",
            "alert_type": "cost_gap",
            "description": "No formal treatment cost estimate has been linked to this journey.",
            "detected_reason": "Journey has zero estimate line items in the cost ledger.",
            "suggested_action": "Request a verified quotation from the hospital's International Patient Department.",
            "requires_human_action": True,
            "task_id": None
        })
    else:
        # Check for unconfirmed items
        unconfirmed = [item for item in line_items if item.confirmation_status in ["estimated", "tentative"]]
        if len(unconfirmed) > len(line_items) / 2:
            conflicts.append({
                "severity": "info",
                "alert_type": "cost_gap",
                "description": f"{len(unconfirmed)} cost estimate line items are pending official hospital billing confirmation.",
                "detected_reason": "Preliminary prices are subject to variance pending in-person surgical assessment.",
                "suggested_action": "Request fixed-price package confirmation from hospital coordinator.",
                "requires_human_action": False,
                "task_id": None
            })

    # 4. Rule: Hospital Accreditation & Verification Status Check
    if journey.selected_hospital_id:
        hospital = db.query(Hospital).filter(Hospital.id == journey.selected_hospital_id).first()
        if hospital and not hospital.is_verified:
            conflicts.append({
                "severity": "warning",
                "alert_type": "unverified_data",
                "description": f"Selected hospital '{hospital.name}' has unverified credential status on the platform.",
                "detected_reason": "Institutional accreditations and credentials have not completed platform admin audit.",
                "suggested_action": "Request verified credential dossier or prioritize accredited partner facilities.",
                "requires_human_action": True,
                "task_id": None
            })

    # 5. Rule: Document Readiness Check (Passport / Visa)
    doc_categories = {doc.category for doc in documents}
    if "passport" not in doc_categories:
        conflicts.append({
            "severity": "warning",
            "alert_type": "missing_confirmation",
            "description": "No passport copy uploaded to Secure Document Centre.",
            "detected_reason": "International hospital registration and visa issuing require valid identity verification.",
            "suggested_action": "Upload a secure copy of your passport in the Document Centre.",
            "requires_human_action": True,
            "task_id": None
        })

    return conflicts

def sync_journey_alerts(db: Session, journey_id: str) -> List[JourneyAlert]:
    """
    Runs the deterministic conflict engine and synchronizes the database JourneyAlert records.
    """
    detected = detect_journey_conflicts(db, journey_id)
    
    # Clear existing unresolved alerts for this journey
    db.query(JourneyAlert).filter(JourneyAlert.journey_id == journey_id).delete()
    
    created_alerts = []
    for c in detected:
        alert = JourneyAlert(
            journey_id=journey_id,
            task_id=c.get("task_id"),
            severity=c["severity"],
            alert_type=c["alert_type"],
            description=c["description"],
            detected_reason=c["detected_reason"],
            suggested_action=c["suggested_action"],
            requires_human_action=c["requires_human_action"],
            is_resolved=False
        )
        db.add(alert)
        created_alerts.append(alert)
        
    db.commit()
    return created_alerts
