def test_get_hospitals_list(client):
    response = client.get("/api/v1/hospitals")
    assert response.status_code == 200
    hospitals = response.json()
    assert len(hospitals) >= 3
    # Check that hospitals have proper fields
    first = hospitals[0]
    assert "name" in first
    assert "country" in first
    assert "services" in first
    assert "credentials" in first
    assert "rating_score" in first

def test_filter_hospitals_by_country(client):
    response = client.get("/api/v1/hospitals?country=Thailand")
    assert response.status_code == 200
    hospitals = response.json()
    assert len(hospitals) >= 1
    assert all(h["country"] == "Thailand" for h in hospitals)

def test_compare_hospitals(client):
    # Fetch first 2 hospitals
    h_res = client.get("/api/v1/hospitals")
    h_list = h_res.json()
    ids = f"{h_list[0]['id']},{h_list[1]['id']}"
    
    comp_res = client.get(f"/api/v1/hospitals/compare?ids={ids}")
    assert comp_res.status_code == 200
    data = comp_res.json()
    assert data["count"] == 2
    assert len(data["hospitals"]) == 2
    assert "match_explanation" in data["hospitals"][0]
    assert "disclaimer" in data
