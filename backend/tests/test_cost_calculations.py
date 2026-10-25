def test_cost_breakdown_and_missing_categories(client):
    login_res = client.post("/api/v1/auth/login", json={
        "email": "patient@mediglobe.ai",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    journeys_res = client.get("/api/v1/journeys", headers=headers)
    journey_id = journeys_res.json()[0]["id"]

    cost_res = client.get(f"/api/v1/journeys/{journey_id}/costs", headers=headers)
    assert cost_res.status_code == 200
    cost_data = cost_res.json()

    assert "grand_total" in cost_data
    assert cost_data["grand_total"] > 0
    assert "categories" in cost_data
    assert "completeness_percentage" in cost_data
    # In seed data, transport was intentionally omitted to verify missing category detection
    assert "missing_categories" in cost_data
    assert any("Transfer" in c or "transport" in c.lower() for c in cost_data["missing_categories"])
    assert "disclaimer" in cost_data

def test_cost_compare_endpoint(client):
    res = client.post("/api/v1/costs/compare?treatment_category=Cardiology")
    assert res.status_code == 200
    data = res.json()
    assert "comparison" in data
    assert len(data["comparison"]) >= 1
    item = data["comparison"][0]
    assert "base_procedure_cost" in item
    assert "estimated_total_range" in item
