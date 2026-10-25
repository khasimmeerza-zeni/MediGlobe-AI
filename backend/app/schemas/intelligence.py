from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class JourneyAlertResponse(BaseModel):
    id: str
    journey_id: str
    task_id: Optional[str] = None
    severity: str  # critical, warning, info
    alert_type: str  # overlap, date_conflict, missing_confirmation, unverified_data, cost_gap
    description: str
    detected_reason: str
    suggested_action: str
    requires_human_action: bool
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ReadinessMetric(BaseModel):
    category: str
    weight: int
    score: float
    max_score: float
    status: str
    details: str

class JourneyValidationResult(BaseModel):
    journey_id: str
    readiness_score: float  # 0 to 100
    score_grade: str  # e.g., "Ready", "Attention Needed", "High Risk / Incomplete"
    metrics_breakdown: List[ReadinessMetric]
    total_alerts: int
    critical_count: int
    warning_count: int
    info_count: int
    alerts: List[JourneyAlertResponse]
    ai_executive_summary: Optional[str] = None
    disclaimer: str = "Journey Readiness Score is an administrative logistical checklist indicator. It does NOT evaluate clinical suitability or treatment outcomes."
