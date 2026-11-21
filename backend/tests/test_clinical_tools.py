import asyncio
import json
import pytest
from src.infrastructure.tools import create_default_tool_router
from src.infrastructure.database.neon_repository import NeonRepository, DEFAULT_ALZ_PATIENT_ID, DEFAULT_ADHD_PATIENT_ID
from src.infrastructure.llm.prompt_templates import (
    get_system_prompt,
    SYSTEM_PROMPT_ALZHEIMER,
    SYSTEM_PROMPT_ADHD,
    SYSTEM_PROMPT_NORMAL
)
from src.core.entities.cognitive_mode import CognitiveMode

@pytest.fixture
def repo():
    return NeonRepository()

@pytest.fixture
def tool_router(repo):
    return create_default_tool_router(repo)

def test_all_clinical_tools_registered(tool_router):
    tools = tool_router.get_tool_definitions()
    names = [t["function"]["name"] for t in tools]
    
    expected = [
        "get_current_weather",
        "search_web",
        "get_caregiver_patient_summary",
        "confirm_medication_dose",
        "lookup_medications",
        "lookup_family_memory",
        "lookup_item_location",
        "decompose_adhd_task",
        "get_adhd_tasks",
        "complete_adhd_task"
    ]
    for exp in expected:
        assert exp in names, f"Tool '{exp}' not found in registered tools"

def test_lookup_medications_neon(tool_router):
    result_str = asyncio.run(tool_router.execute_tool(
        "lookup_medications",
        {"patient_id": DEFAULT_ALZ_PATIENT_ID}
    ))
    data = json.loads(result_str)
    assert data["status"] == "success"
    meds_info = data["data"]
    assert "medications" in meds_info
    assert meds_info["count"] > 0
    # Check that seeded medication (Concor or Donepezil) exists
    med_names = [m["name"] for m in meds_info["medications"]]
    assert any("Concor" in n or "Donepezil" in n or "كونكور" in n or "أريسبت" in n for n in med_names)

def test_confirm_medication_dose_neon(tool_router):
    result_str = asyncio.run(tool_router.execute_tool(
        "confirm_medication_dose",
        {
            "status": "taken",
            "note": "أخدت القرص الأصفر مع كوباية مية",
            "patient_id": DEFAULT_ALZ_PATIENT_ID
        }
    ))
    data = json.loads(result_str)
    assert data["status"] == "success"
    assert data["data"]["status"] == "taken"
    assert data["data"]["db_recorded"] is True

def test_lookup_family_memory_neon(tool_router):
    result_str = asyncio.run(tool_router.execute_tool(
        "lookup_family_memory",
        {"relation_or_name": "أحمد"}
    ))
    data = json.loads(result_str)
    assert data["status"] == "success"
    records = data["data"]["family_records"]
    assert len(records) > 0
    names = [r["name"] for r in records]
    assert any("أحمد" in n for n in names)

def test_lookup_item_location_neon(tool_router):
    result_str = asyncio.run(tool_router.execute_tool(
        "lookup_item_location",
        {"item_name": "المفاتيح"}
    ))
    data = json.loads(result_str)
    assert data["status"] == "success"
    assert "طاولة المدخل" in data["data"]["location"]

def test_decompose_adhd_task_neon(tool_router):
    result_str = asyncio.run(tool_router.execute_tool(
        "decompose_adhd_task",
        {
            "task_title": "مذاكرة مادة الكيمياء العضوية",
            "patient_id": DEFAULT_ADHD_PATIENT_ID
        }
    ))
    data = json.loads(result_str)
    assert data["status"] == "success"
    assert data["data"]["estimated_minutes"] == 2
    assert "دقيقتين" in data["data"]["immediate_micro_step"] or "صفحة" in data["data"]["immediate_micro_step"]
    assert "db_task_id" in data["data"]

def test_get_adhd_tasks_neon(tool_router):
    result_str = asyncio.run(tool_router.execute_tool(
        "get_adhd_tasks",
        {"patient_id": DEFAULT_ADHD_PATIENT_ID}
    ))
    data = json.loads(result_str)
    assert data["status"] == "success"
    assert data["data"]["total_tasks_count"] >= 1
    assert data["data"]["current_focus_task"] is not None

def test_complete_adhd_task_neon(tool_router, repo):
    # First create a task
    created = asyncio.run(repo.add_adhd_task(
        patient_id=DEFAULT_ADHD_PATIENT_ID,
        title="مهمة تجريبية سريعة",
        description="خطوة اختبارية",
        target_pomodoros=1
    ))
    task_id = str(created["id"])
    
    # Complete via tool router
    result_str = asyncio.run(tool_router.execute_tool(
        "complete_adhd_task",
        {"task_id": task_id}
    ))
    data = json.loads(result_str)
    assert data["status"] == "success"
    assert data["data"]["status"] == "COMPLETED"
    assert "dopamine_reward" in data["data"]

def test_clinical_prompts_standards():
    alz_prompt = get_system_prompt(CognitiveMode.ALZHEIMER)
    adhd_prompt = get_system_prompt(CognitiveMode.ADHD)
    normal_prompt = get_system_prompt(CognitiveMode.NORMAL)

    # Alzheimer clinical guidance checks
    assert "Validation Therapy" in alz_prompt
    assert "ADRD-Bench" in alz_prompt
    assert "lookup_medications" in alz_prompt
    assert "lookup_family_memory" in alz_prompt
    assert "lookup_item_location" in alz_prompt

    # ADHD clinical guidance checks
    assert "MIT Task-Breakdown" in alz_prompt or "MIT Task-Breakdown" in adhd_prompt
    assert "Wall of Awful" in adhd_prompt or "الشلل التنفيذي" in adhd_prompt
    assert "decompose_adhd_task" in adhd_prompt
    assert "complete_adhd_task" in adhd_prompt

    # Normal productivity checks
    assert "get_current_weather" in normal_prompt
    assert "search_web" in normal_prompt
