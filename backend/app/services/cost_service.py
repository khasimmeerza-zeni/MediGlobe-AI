from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.models.cost import EstimateLineItem, TreatmentEstimate
from backend.app.models.hospital import Hospital
from backend.app.models.journey import Journey
from backend.app.schemas.cost import CostBreakdownResponse, CategoryCostSummary, EstimateLineItemResponse, HospitalCostComparisonItem, CostCompareResponse

CATEGORY_LABELS = {
    "provider_procedure": "Hospital & Surgical Procedure",
    "diagnostics": "Pre-Operative Diagnostics & Lab Panels",
    "consultation": "Specialist & Anesthesia Consultations",
    "accommodation": "Medical-Adjacent Recovery Lodging",
    "transport": "Airport & Local Medical Transfers",
    "visa_admin": "Medical Visa & Administrative Processing",
    "translation": "Medical Interpretation & Translation",
    "other": "Incidentals & Contingency Buffer"
}

STANDARD_REQUIRED_CATEGORIES = [
    "provider_procedure",
    "diagnostics",
    "consultation",
    "accommodation",
    "transport"
]

def get_journey_cost_breakdown(db: Session, journey_id: str) -> CostBreakdownResponse:
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    line_items = db.query(EstimateLineItem).filter(EstimateLineItem.journey_id == journey_id).all()
    
    currency = journey.currency if journey else "USD"
    grand_total = 0.0
    confirmed_total = 0.0
    unconfirmed_total = 0.0
    unconfirmed_count = 0

    category_buckets: Dict[str, List[EstimateLineItem]] = {cat: [] for cat in CATEGORY_LABELS.keys()}
    
    for item in line_items:
        grand_total += item.estimated_amount
        if item.confirmation_status in ["confirmed", "quoted_by_hospital"]:
            confirmed_total += item.estimated_amount
        else:
            unconfirmed_total += item.estimated_amount
            unconfirmed_count += 1
            
        cat = item.category if item.category in category_buckets else "other"
        category_buckets[cat].append(item)

    categories_summary: List[CategoryCostSummary] = []
    present_categories = set()
    
    for cat_key, items in category_buckets.items():
        if items:
            present_categories.add(cat_key)
            subtotal = sum(i.estimated_amount for i in items)
            categories_summary.append(CategoryCostSummary(
                category=cat_key,
                label=CATEGORY_LABELS.get(cat_key, cat_key),
                subtotal=round(subtotal, 2),
                item_count=len(items),
                items=[EstimateLineItemResponse.model_validate(i) for i in items]
            ))

    missing_categories = [
        CATEGORY_LABELS.get(rc, rc) for rc in STANDARD_REQUIRED_CATEGORIES if rc not in present_categories
    ]

    # Calculate Completeness & Confidence
    req_count = len(STANDARD_REQUIRED_CATEGORIES)
    covered_req_count = len([rc for rc in STANDARD_REQUIRED_CATEGORIES if rc in present_categories])
    completeness_percentage = round((covered_req_count / req_count) * 100, 1)

    if completeness_percentage >= 80 and unconfirmed_count <= 1:
        confidence = "high"
    elif completeness_percentage >= 50:
        confidence = "medium"
    else:
        confidence = "insufficient_information"

    warning_notes = []
    if missing_categories:
        warning_notes.append(f"Missing essential budget categories: {', '.join(missing_categories)}.")
    if unconfirmed_count > 0:
        warning_notes.append(f"{unconfirmed_count} line items have unconfirmed status and may fluctuate based on clinical presentation.")

    # Update journey total
    if journey:
        journey.total_estimated_cost = round(grand_total, 2)
        db.commit()

    return CostBreakdownResponse(
        journey_id=journey_id,
        currency=currency,
        grand_total=round(grand_total, 2),
        confirmed_total=round(confirmed_total, 2),
        unconfirmed_total=round(unconfirmed_total, 2),
        confidence_level=confidence,
        completeness_percentage=completeness_percentage,
        categories=categories_summary,
        missing_categories=missing_categories,
        unconfirmed_items_count=unconfirmed_count,
        warning_notes=warning_notes,
        disclaimer="Estimates represent non-binding administrative guidance calculated from provider records. Final surgical quotes depend on mandatory on-site clinical evaluation."
    )

def compare_treatment_costs(db: Session, treatment_category: str, currency: str = "USD") -> CostCompareResponse:
    estimates = db.query(TreatmentEstimate).filter(
        TreatmentEstimate.treatment_category.ilike(f"%{treatment_category}%")
    ).all()
    
    # If no exact match, return all available estimates
    if not estimates:
        estimates = db.query(TreatmentEstimate).limit(5).all()

    comparison_items: List[HospitalCostComparisonItem] = []
    for est in estimates:
        hospital = db.query(Hospital).filter(Hospital.id == est.hospital_id).first()
        if not hospital:
            continue
            
        # Standard travel & accommodation benchmark calculations
        estimated_travel = 850.0  # benchmark international flight
        estimated_stay = 1200.0   # 10 days at recovery rate ($120/night)
        
        comparison_items.append(HospitalCostComparisonItem(
            hospital_id=hospital.id,
            hospital_name=hospital.name,
            country=hospital.country,
            city=hospital.city,
            base_procedure_cost=est.base_cost,
            estimated_travel_cost=estimated_travel,
            estimated_stay_cost=estimated_stay,
            estimated_total_range={
                "min": round(est.min_cost + estimated_travel + estimated_stay, 2),
                "max": round(est.max_cost + estimated_travel + estimated_stay + 500, 2)
            },
            currency=est.currency,
            included_services=est.inclusions or [],
            excluded_services=est.exclusions or [],
            confidence_rating="Verified Provider Submission" if est.is_published else "Preliminary Estimate"
        ))

    return CostCompareResponse(
        treatment_category=treatment_category,
        currency=currency,
        comparison=comparison_items,
        ai_financial_summary=f"Cost analysis for {treatment_category} across {len(comparison_items)} international providers: Procedure estimates vary according to included implant types, specialist tenure, and pre-op diagnostic completeness."
    )
