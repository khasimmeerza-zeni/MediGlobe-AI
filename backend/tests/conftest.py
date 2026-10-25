import pytest
from fastapi.testclient import TestClient
from backend.app.core.database import SessionLocal, Base, engine, get_db
from backend.app.main import app
from backend.app.seed import seed_database

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    # Ensure database is created and seeded
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

@pytest.fixture
def client():
    return TestClient(app)
