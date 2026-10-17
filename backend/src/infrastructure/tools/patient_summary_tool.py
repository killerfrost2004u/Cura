from typing import Dict, Any

async def get_caregiver_patient_summary(days: int = 2) -> Dict[str, Any]:
    """
    FR-ALZ-009: Tool to aggregate patient logs for the last 2 days.
    """
    return {
        "period_days": days,
        "medications_taken": 6,
        "medications_total": 6,
        "adherence_rate": "100%",
        "repeated_questions_count": 3,
        "tasks_completed": 4,
        "emergency_events_count": 0,
        "general_mood": "مستقر وهادئ",
    }
