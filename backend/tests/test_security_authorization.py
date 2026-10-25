def test_patient_cannot_access_admin_portal(client):
    login_res = client.post("/api/v1/auth/login", json={
        "email": "patient@mediglobe.ai",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/admin/audit-logs", headers=headers)
    assert res.status_code == 403
    assert "Access denied" in res.json()["detail"]

def test_platform_admin_can_access_admin_portal(client):
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@mediglobe.ai",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/admin/audit-logs", headers=headers)
    assert res.status_code == 200
    logs = res.json()
    assert isinstance(logs, list)

def test_unauthenticated_request_rejected(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401
