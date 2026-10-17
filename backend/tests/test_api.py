from fastapi.testclient import TestClient
from src.presentation.api.main import app

client = TestClient(app)

def test_root_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["project"] == "CURA"

def test_health_endpoint():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert "Raspberry Pi 4" in data["target_platform"]

def test_emergency_trigger_endpoint():
    payload = {
        "patient_id": "patient-001",
        "source": "hardware_button",
        "latitude": 30.0444,
        "longitude": 31.2357,
        "notes": "Emergency button test",
    }
    res = client.post("/api/v1/emergency/trigger", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "success"
    assert body["data"]["broadcast_status"] == "SENT_TO_ALL_CAREGIVERS"

def test_patient_summary_endpoint():
    res = client.get("/api/v1/patients/patient-001/summary?days=2")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "success"
    assert "spoken_summary_arabic" in body["data"]

def test_voice_interact_text():
    payload = {
        "text": "درجة الحرارة كام في القاهرة؟",
        "mode": "normal",
        "patient_id": "patient-001",
    }
    res = client.post("/api/v1/voice/interact-text", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "success"
    assert "response_text" in body["data"]
