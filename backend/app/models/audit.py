import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Float, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class KnowledgeSource(Base):
    __tablename__ = "knowledge_sources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    publisher = Column(String(255), nullable=False)
    source_url = Column(String(500), nullable=True)
    source_category = Column(String(100), nullable=False)  # visa_policy, hospital_guideline, clinical_travel, cost_benchmark
    text_content = Column(Text, nullable=False)
    retrieval_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_verified_date = Column(DateTime, nullable=True)
    access_policy = Column(String(50), default="public")  # public, restricted, provider_internal


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    journey_id = Column(String(36), ForeignKey("journeys.id", ondelete="CASCADE"), nullable=False)
    recommendation_type = Column(String(100), nullable=False)  # journey_plan, cost_optimization, logistics_warning
    content = Column(JSON, nullable=False)
    confidence_score = Column(Float, default=0.9)
    grounded_source_ids = Column(JSON, default=list)  # list of KnowledgeSource ids
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class JourneyAlert(Base):
    __tablename__ = "journey_alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    journey_id = Column(String(36), ForeignKey("journeys.id", ondelete="CASCADE"), nullable=False)
    task_id = Column(String(36), ForeignKey("journey_tasks.id", ondelete="SET NULL"), nullable=True)
    severity = Column(String(50), nullable=False)  # info, warning, critical
    alert_type = Column(String(100), nullable=False)  # overlap, date_conflict, missing_confirmation, unverified_data, cost_gap
    description = Column(Text, nullable=False)
    detected_reason = Column(Text, nullable=False)
    suggested_action = Column(Text, nullable=False)
    requires_human_action = Column(Boolean, default=True)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    journey = relationship("Journey", back_populates="alerts")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    notification_type = Column(String(50), default="system")  # alert, reminder, verification, update
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False)  # e.g., "login", "view_document", "grant_permission", "update_task", "verify_hospital"
    resource_type = Column(String(100), nullable=False)  # "document", "journey", "hospital", "user"
    resource_id = Column(String(255), nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
