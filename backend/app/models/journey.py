import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Float, Text, JSON, Integer
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Journey(Base):
    __tablename__ = "journeys"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    treatment_category = Column(String(100), nullable=False)
    selected_hospital_id = Column(String(36), ForeignKey("hospitals.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="planning")  # draft, planning, booked, in_travel, completed, cancelled
    readiness_score = Column(Float, default=0.0)  # Calculated transparently (0 to 100)
    readiness_breakdown = Column(JSON, default=dict)
    
    departure_date = Column(DateTime, nullable=True)
    return_date = Column(DateTime, nullable=True)
    currency = Column(String(10), default="USD")
    total_estimated_cost = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="journeys")
    selected_hospital = relationship("Hospital")
    stages = relationship("JourneyStage", back_populates="journey", cascade="all, delete-orphan", order_by="JourneyStage.stage_order")
    tasks = relationship("JourneyTask", back_populates="journey", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="journey", cascade="all, delete-orphan")
    travel_arrangements = relationship("TravelArrangement", back_populates="journey", cascade="all, delete-orphan")
    line_items = relationship("EstimateLineItem", back_populates="journey", cascade="all, delete-orphan")
    alerts = relationship("JourneyAlert", back_populates="journey", cascade="all, delete-orphan")


class JourneyStage(Base):
    __tablename__ = "journey_stages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    journey_id = Column(String(36), ForeignKey("journeys.id", ondelete="CASCADE"), nullable=False)
    stage_order = Column(Integer, nullable=False)  # 1 to 7
    stage_name = Column(String(100), nullable=False)
    status = Column(String(50), default="not_started")  # not_started, in_progress, completed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    journey = relationship("Journey", back_populates="stages")
    tasks = relationship("JourneyTask", back_populates="stage", cascade="all, delete-orphan")


class JourneyTask(Base):
    __tablename__ = "journey_tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    stage_id = Column(String(36), ForeignKey("journey_stages.id", ondelete="CASCADE"), nullable=False)
    journey_id = Column(String(36), ForeignKey("journeys.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="not_started")  # not_started, in_progress, awaiting_confirmation, completed, blocked
    priority = Column(String(50), default="medium")     # low, medium, high, urgent
    dependencies = Column(JSON, default=list)           # list of task IDs
    due_date = Column(DateTime, nullable=True)
    responsible_party = Column(String(100), default="patient")  # patient, hospital_coordinator, travel_agent, local_doctor
    source_references = Column(JSON, default=list)      # reference document/policy ids
    requires_confirmation = Column(Boolean, default=False)
    warning_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    stage = relationship("JourneyStage", back_populates="tasks")
    journey = relationship("Journey", back_populates="tasks")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    journey_id = Column(String(36), ForeignKey("journeys.id", ondelete="CASCADE"), nullable=False)
    hospital_id = Column(String(36), ForeignKey("hospitals.id", ondelete="SET NULL"), nullable=True)
    appointment_type = Column(String(100), nullable=False)  # pre_op_consult, procedure, follow_up, diagnostics
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    location = Column(String(255), nullable=False)
    doctor_name = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    status = Column(String(50), default="scheduled")  # scheduled, confirmed, completed, cancelled
    is_teleconsult = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    journey = relationship("Journey", back_populates="appointments")
    hospital = relationship("Hospital")


class TravelArrangement(Base):
    __tablename__ = "travel_arrangements"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    journey_id = Column(String(36), ForeignKey("journeys.id", ondelete="CASCADE"), nullable=False)
    arrangement_type = Column(String(50), nullable=False)  # flight, transfer, hotel, visa
    provider_name = Column(String(255), nullable=False)
    confirmation_code = Column(String(100), nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    departure_location = Column(String(255), nullable=True)
    arrival_location = Column(String(255), nullable=True)
    cost = Column(Float, default=0.0)
    currency = Column(String(10), default="USD")
    status = Column(String(50), default="tentative")  # tentative, confirmed, completed, cancelled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    journey = relationship("Journey", back_populates="travel_arrangements")
