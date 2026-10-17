import asyncio
import json
from src.infrastructure.tools import create_default_tool_router

def test_tool_router_registration():
    router = create_default_tool_router()
    tools = router.get_tool_definitions()
    tool_names = [t["function"]["name"] for t in tools]
    
    assert "get_current_weather" in tool_names
    assert "search_web" in tool_names
    assert "get_caregiver_patient_summary" in tool_names
    assert "confirm_medication_dose" in tool_names

def test_weather_tool_execution():
    router = create_default_tool_router()
    result_str = asyncio.run(router.execute_tool("get_current_weather", {"city": "Cairo"}))
    data = json.loads(result_str)
    
    assert data["status"] == "success"
    assert "temperature_celsius" in data["data"]
    assert data["data"]["city"] == "Cairo"

def test_caregiver_summary_tool():
    router = create_default_tool_router()
    result_str = asyncio.run(router.execute_tool("get_caregiver_patient_summary", {"days": 2}))
    data = json.loads(result_str)
    
    assert data["status"] == "success"
    assert data["data"]["period_days"] == 2
    assert "adherence_rate" in data["data"]
