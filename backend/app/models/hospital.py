import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Float, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    name = Column(String(255), nullable=False, index=True)
    country = Column(String(100), nullable=False, index=True)
    city = Column(String(100), nullable=False, index=True)
    address = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    logo_url = Column(String(500), nullable=True)
    rating_score = Column(Float, default=4.5)
    
    # Verification & Trust Metadata
    is_verified = Column(Boolean, default=False)
    verification_date = Column(DateTime, nullable=True)
    verified_by = Column(String(255), nullable=True)
    verification_notes = Column(Text, nullable=True)
    is_demo_data = Column(Boolean, default=True)

    languages = Column(JSON, default=lambda: ["English"])  # e.g. ["English", "Thai", "Arabic"]
    contact_email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    services = relationship("HospitalService", back_populates="hospital", cascade="all, delete-orphan")
    credentials = relationship("HospitalCredential", back_populates="hospital", cascade="all, delete-orphan")
    estimates = relationship("TreatmentEstimate", back_populates="hospital", cascade="all, delete-orphan")


class HospitalService(Base):
    __tablename__ = "hospital_services"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    hospital_id = Column(String(36), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(100), nullable=False, index=True)  # Cardiology, Orthopedics, Oncology, etc.
    service_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    hospital = relationship("Hospital", back_populates="services")


class HospitalCredential(Base):
    __tablename__ = "hospital_credentials"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    hospital_id = Column(String(36), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)  # e.g. "JCI International Hospital Accreditation"
    issuer = Column(String(255), nullable=False)  # e.g. "Joint Commission International"
    issue_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    credential_type = Column(String(100), default="accreditation")  # accreditation, iso_certification, license
    verification_status = Column(String(50), default="unverified")  # verified, unverified, pending_review, rejected
    verified_at = Column(DateTime, nullable=True)
    evidence_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    hospital = relationship("Hospital", back_populates="credentials")
