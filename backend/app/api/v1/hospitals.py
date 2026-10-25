from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user, get_optional_current_user
from backend.app.models.user import User, PatientPreference
from backend.app.models.hospital import Hospital, HospitalService, HospitalCredential
from backend.app.models.cost import TreatmentEstimate
from backend.app.schemas.hospital import HospitalResponse
from backend.app.ai.provider import get_ai_provider

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])

@router.get("", response_model=List[HospitalResponse])
def get_hospitals(
    country: Optional[str] = None,
    city: Optional[str] = None,
    treatment: Optional[str] = None,
    verified_only: Optional[bool] = False,
    max_budget: Optional[float] = None,
    language: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Hospital)
    if country:
        query = query.filter(Hospital.country.ilike(f"%{country}%"))
    if city:
        query = query.filter(Hospital.city.ilike(f"%{city}%"))
    if verified_only:
        query = query.filter(Hospital.is_verified == True)

    hospitals = query.all()
    results = []

    for h in hospitals:
        # Filter by language if specified
        if language and language not in (h.languages or []):
            continue
        # Filter by treatment service if specified
        if treatment:
            services = [s.category.lower() for s in h.services] + [s.service_name.lower() for s in h.services]
            if not any(treatment.lower() in s for s in services):
                continue
        # Filter by max budget if specified
        if max_budget is not None and h.estimates:
            min_base = min(e.base_cost for e in h.estimates)
            if min_base > max_budget:
                continue

        results.append(HospitalResponse.model_validate(h))

    return results

@router.get("/compare")
async def compare_hospitals(
    ids: str = Query(..., description="Comma-separated list of hospital IDs (up to 3)"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    hospital_ids = [hid.strip() for hid in ids.split(",") if hid.strip()][:3]
    if not hospital_ids:
        raise HTTPException(status_code=400, detail="Please provide at least 1 hospital ID")

    hospitals = db.query(Hospital).filter(Hospital.id.in_(hospital_ids)).all()
    if not hospitals:
        raise HTTPException(status_code=404, detail="No matching hospitals found")

    pref = None
    if current_user:
        pref = db.query(PatientPreference).filter(PatientPreference.user_id == current_user.id).first()

    pref_dict = {
        "treatment_category": pref.treatment_category if pref else "General International Care",
        "preferred_destinations": pref.preferred_destinations if pref else []
    }

    ai_provider = get_ai_provider()
    comparison_data = []

    for h in hospitals:
        h_resp = HospitalResponse.model_validate(h)
        match_explanation = await ai_provider.explain_hospital_match(pref_dict, {
            "name": h.name,
            "country": h.country,
            "is_verified": h.is_verified,
            "languages": h.languages
        })
        comparison_data.append({
            "hospital": h_resp,
            "match_explanation": match_explanation,
            "verification_status": "Verified Partner" if h.is_verified else "Pending Compliance Verification"
        })

    return {
        "count": len(comparison_data),
        "hospitals": comparison_data,
        "disclaimer": "Comparisons represent administrative credentials and provider-supplied estimates. They do not rank or endorse clinical surgical efficacy."
    }

@router.get("/{hospital_id}", response_model=HospitalResponse)
def get_hospital_details(hospital_id: str, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return HospitalResponse.model_validate(hospital)

@router.post("/{hospital_id}/consult-request")
def request_consultation(
    hospital_id: str,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    return {
        "status": "request_received",
        "message": f"Consultation inquiry transmitted to {hospital.name} International Patient Department.",
        "hospital_id": hospital.id,
        "contact_email": hospital.contact_email,
        "reference_id": f"REQ-MED-{hospital.id[:6].upper()}"
    }
