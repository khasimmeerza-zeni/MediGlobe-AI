import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Float, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="patient")  # patient, hospital_admin, platform_admin
    hospital_id = Column(String(36), nullable=True)  # Links hospital_admin to specific hospital
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    preferences = relationship("PatientPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    journeys = relationship("Journey", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    consents = relationship("Consent", back_populates="user", cascade="all, delete-orphan")


class PatientPreference(Base):
    __tablename__ = "patient_preferences"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    residence_country = Column(String(100), nullable=False)
    preferred_destinations = Column(JSON, default=list)  # list of country strings
    treatment_category = Column(String(100), nullable=False)
    budget_min = Column(Float, nullable=True)
    budget_max = Column(Float, nullable=True)
    currency = Column(String(10), default="USD")
    preferred_language = Column(String(50), default="English")
    travel_flexibility = Column(String(50), default="flexible")  # flexible, fixed_dates, within_month
    approximate_travel_date = Column(String(50), nullable=True)
    accessibility_needs = Column(Text, nullable=True)
    help_with_docs = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="preferences")
