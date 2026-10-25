import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Integer, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    journey_id = Column(String(36), ForeignKey("journeys.id", ondelete="SET NULL"), nullable=True)
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_path = Column(String(500), nullable=False)  # Private filesystem storage path
    category = Column(String(50), nullable=False)  # passport, visa, medical_record, lab_result, insurance, hospital_quote, discharge_summary, other
    is_sensitive = Column(Boolean, default=True)
    
    # AI Extraction & Summarization Metadata
    ai_summary = Column(Text, nullable=True)
    extracted_metadata = Column(JSON, default=dict)
    ai_processed_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="documents")
    permissions = relationship("DocumentPermission", back_populates="document", cascade="all, delete-orphan")


class DocumentPermission(Base):
    __tablename__ = "document_permissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    granted_to_user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    granted_to_hospital_id = Column(String(36), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=True)
    permission_type = Column(String(50), default="view")  # view, download
    expires_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    document = relationship("Document", back_populates="permissions")


class Consent(Base):
    __tablename__ = "consents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    consent_type = Column(String(100), nullable=False)  # data_processing, ai_analysis, hospital_sharing
    is_granted = Column(Boolean, default=False)
    granted_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="consents")
