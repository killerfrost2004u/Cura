from enum import Enum
from dataclasses import dataclass, field
from typing import Dict, Any, Optional

class IntentType(str, Enum):
    # Everyday / Normal
    GENERAL_QUERY = "general_query"
    WEATHER_QUERY = "weather_query"
    WEB_SEARCH = "web_search"
    SET_TIMER = "set_timer"
    APP_CONTROL = "app_control"
    
    # Alzheimer Care
    MEDICATION_CONFIRM = "medication_confirm"   # "أخدت الدواء خلاص"
    ITEM_LOCATION_QUERY = "item_location_query" # "فين مفاتيحي؟"
    ITEM_LOCATION_STORE = "item_location_store" # "حطيت المحفظة في الدرج"
    CAREGIVER_SUMMARY = "caregiver_summary"     # "عمل إيه آخر يومين؟"
    REPEATED_QUESTION = "repeated_question"     # Detected re-ask
    
    # ADHD Support
    TASK_CREATE = "task_create"
    TASK_PRIORITIZE = "task_prioritize"
    TASK_COMPLETE = "task_complete"
    FOCUS_SESSION_START = "focus_session_start"
    BREATHING_EXERCISE = "breathing_exercise"
    
    # Critical
    EMERGENCY_TRIGGER = "emergency_trigger"     # "إلحقوني" / SOS Button

@dataclass
class Intent:
    type: IntentType
    confidence: float
    raw_text: str
    parameters: Dict[str, Any] = field(default_factory=dict)
    normalized_query: Optional[str] = None
