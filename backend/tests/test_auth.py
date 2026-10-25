import uuid

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data

def test_login_patient_success(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "patient@mediglobe.ai",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["role"] == "patient"
    assert data["user"]["email"] == "patient@mediglobe.ai"

def test_login_invalid_password(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "patient@mediglobe.ai",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_register_new_user(client):
    random_email = f"patient_{uuid.uuid4().hex[:6]}@mediglobe.ai"
    response = client.post("/api/v1/auth/register", json={
        "email": random_email,
        "password": "strongPassword123",
        "full_name": "David Miller",
        "role": "patient"
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["full_name"] == "David Miller"
