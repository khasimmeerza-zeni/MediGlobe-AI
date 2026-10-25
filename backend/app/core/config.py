import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MediGlobe AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "mediglobe-ai-super-secret-production-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./mediglobe.db")
    
    # AI Engine Provider: "mock", "gemini", or "openai"
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "mock")
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    AI_MODEL_NAME: str = os.getenv("AI_MODEL_NAME", "gemini-2.5-flash")
    
    # File Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./storage/documents")
    MAX_UPLOAD_SIZE_MB: int = 25
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".jpg", ".jpeg", ".png", ".docx", ".txt"]

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
