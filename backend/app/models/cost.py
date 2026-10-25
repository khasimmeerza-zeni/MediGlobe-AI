import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Float, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class TreatmentEstimate(Base):
    __tablename__ = "treatment_estimates"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    hospital_id = Column(String(36), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    treatment_category = Column(String(100), nullable=False, index=True)
    treatment_name = Column(String(255), nullable=False)
    currency = Column(String(10), default="USD")
    base_cost = Column(Float, nullable=False)
    min_cost = Column(Float, nullable=False)
    max_cost = Column(Float, nullable=False)
    inclusions = Column(JSON, default=list)   # e.g. ["Pre-op consultation", "Surgeon fees", "Standard 3-day hospital room"]
    exclusions = Column(JSON, default=list)   # e.g. ["Unforeseen ICU stays", "Airport transfer", "Medication post discharge"]
    notes = Column(Text, nullable=True)
    last_verified_at = Column(DateTime, nullable=True)
    is_published = Column(Boolean, default=True)
    is_demo_data = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    hospital = relationship("Hospital", back_populates="estimates")
    line_items = relationship("EstimateLineItem", back_populates="estimate", cascade="all, delete-orphan")


class EstimateLineItem(Base):
    __tablename__ = "estimate_line_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    estimate_id = Column(String(36), ForeignKey("treatment_estimates.id", ondelete="CASCADE"), nullable=True)
    journey_id = Column(String(36), ForeignKey("journeys.id", ondelete="CASCADE"), nullable=True)
    category = Column(String(100), nullable=False)  # provider_procedure, diagnostics, consultation, accommodation, transport, visa_admin, translation, other
    item_name = Column(String(255), nullable=False)
    estimated_amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    confirmation_status = Column(String(50), default="estimated")  # estimated, quoted_by_hospital, confirmed, tentative
    is_included_in_base = Column(Boolean, default=True)
    source_reference = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    estimate = relationship("TreatmentEstimate", back_populates="line_items")
    journey = relationship("Journey", back_populates="line_items")
