from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.database import Base, engine
from backend.app.api.v1 import (
    auth,
    hospitals,
    journeys,
    tasks,
    costs,
    documents,
    appointments,
    intelligence,
    admin
)
from backend.app.seed import seed_database

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="MediGlobe AI - Global Medical Tourism and Journey Planning Platform Backend API",
    version="1.0.0",
    docs_url=f"{settings.API_V1_STR}/docs",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development and preview
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
api_v1 = f"{settings.API_V1_STR}"
app.include_router(auth.router, prefix=api_v1)
app.include_router(hospitals.router, prefix=api_v1)
app.include_router(journeys.router, prefix=api_v1)
app.include_router(tasks.router, prefix=api_v1)
app.include_router(costs.router, prefix=api_v1)
app.include_router(documents.router, prefix=api_v1)
app.include_router(appointments.router, prefix=api_v1)
app.include_router(intelligence.router, prefix=api_v1)
app.include_router(admin.router, prefix=api_v1)

@app.on_event("startup")
def on_startup():
    try:
        seed_database()
    except Exception as e:
        print(f"Seed startup notice: {e}")

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "ai_provider": settings.AI_PROVIDER,
        "database": "connected"
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to MediGlobe AI API",
        "version": "1.0.0",
        "docs_url": f"{settings.API_V1_STR}/docs"
    }
