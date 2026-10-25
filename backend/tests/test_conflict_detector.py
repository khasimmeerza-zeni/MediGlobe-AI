def test_detect_conflicts_and_readiness(client):
    # Log in as patient
    login_res = client.post("/api/v1/auth/login", json={
        "email": "patient@mediglobe.ai",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch user journeys
    journeys_res = client.get("/api/v1/journeys", headers=headers)
    assert journeys_res.status_code == 200
    journeys = journeys_res.json()
    assert len(journeys) >= 1
    journey_id = journeys[0]["id"]

    # Validate journey intelligence
    val_res = client.post(f"/api/v1/journeys/{journey_id}/validate", headers=headers)
    assert val_res.status_code == 200
    val_data = val_res.json()

    assert "readiness_score" in val_data
    assert "metrics_breakdown" in val_data
    assert len(val_data["metrics_breakdown"]) == 5
    assert val_data["total_alerts"] >= 1
    
    # Verify that conflict detection detected the timing collision or lodging issue
    alert_types = [a["alert_type"] for a in val_data["alerts"]]
    assert "overlap" in alert_types or "date_conflict" in alert_types or "cost_gap" in alert_types
    assert "ai_executive_summary" in val_data
