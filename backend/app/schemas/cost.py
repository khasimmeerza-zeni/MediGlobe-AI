from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class EstimateLineItemBase(BaseModel):
    category: str  # provider_procedure, diagnostics, consultation, accommodation, transport, visa_admin, translation, other
    item_name: str
    estimated_amount: float
    currency: str = "USD"
    confirmation_status: str = "estimated"
    is_included_in_base: bool = True
    source_reference: Optional[str] = None
    notes: Optional[str] = None

class EstimateLineItemCreate(EstimateLineItemBase):
    journey_id: Optional[str] = None
    estimate_id: Optional[str] = None

class EstimateLineItemResponse(EstimateLineItemBase):
    id: str
    estimate_id: Optional[str] = None
    journey_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CategoryCostSummary(BaseModel):
    category: str
    label: str
    subtotal: float
    item_count: int
    items: List[EstimateLineItemResponse] = []

class CostBreakdownResponse(BaseModel):
    journey_id: str
    currency: str
    grand_total: float
    confirmed_total: float
    unconfirmed_total: float
    confidence_level: str  # high, medium, insufficient_information
    completeness_percentage: float
    categories: List[CategoryCostSummary] = []
    missing_categories: List[str] = []
    unconfirmed_items_count: int
    warning_notes: List[str] = []
    disclaimer: str

class HospitalCostComparisonItem(BaseModel):
    hospital_id: str
    hospital_name: str
    country: str
    city: str
    base_procedure_cost: float
    estimated_travel_cost: float
    estimated_stay_cost: float
    estimated_total_range: Dict[str, float]
    currency: str
    included_services: List[str]
    excluded_services: List[str]
    confidence_rating: str

class CostCompareResponse(BaseModel):
    treatment_category: str
    currency: str
    comparison: List[HospitalCostComparisonItem]
    ai_financial_summary: Optional[str] = None
