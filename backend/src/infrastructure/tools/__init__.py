from .tool_router_impl import ToolRouterImpl
from .web_search_tool import search_duckduckgo
from .weather_tool import get_current_weather
from .patient_summary_tool import get_caregiver_patient_summary
from .medication_confirm_tool import confirm_medication_dose

def create_default_tool_router() -> ToolRouterImpl:
    router = ToolRouterImpl()
    
    # 1. Weather Tool
    router.register_tool(
        name="get_current_weather",
        description="الحصول على درجة الحرارة وحالة الطقس المحدثة لمدينة معينة.",
        parameters={
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "اسم المدينة، مثل القاهرة أو الإسكندرية."}
            },
            "required": ["city"]
        },
        handler=get_current_weather,
    )

    # 2. Web Search Tool
    router.register_tool(
        name="search_web",
        description="البحث على الإنترنت للحصول على معلومات عامة أو إجابات عن أسئلة المستخدم.",
        parameters={
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "جملة البحث."}
            },
            "required": ["query"]
        },
        handler=search_duckduckgo,
    )

    # 3. Patient Caregiver Summary Tool
    router.register_tool(
        name="get_caregiver_patient_summary",
        description="استخراج ملخص حالة المريض لآخر يومين لأهله أو للطبيب (مواعيد الدواء، تكرار الأسئلة، المهام).",
        parameters={
            "type": "object",
            "properties": {
                "days": {"type": "integer", "description": "عدد الأيام المطلوب تلخيصها، الافتراضي 2."}
            },
            "required": []
        },
        handler=get_caregiver_patient_summary,
    )

    # 4. Medication Dose Confirmation Tool
    router.register_tool(
        name="confirm_medication_dose",
        description="تأكيد أخذ جرعة الدواء صوتياً أو يدوياً وتسجيلها في النظام.",
        parameters={
            "type": "object",
            "properties": {
                "status": {"type": "string", "enum": ["taken", "missed"], "description": "حالة الجرعة."}
            },
            "required": ["status"]
        },
        handler=confirm_medication_dose,
    )

    return router

__all__ = [
    "ToolRouterImpl",
    "search_duckduckgo",
    "get_current_weather",
    "get_caregiver_patient_summary",
    "confirm_medication_dose",
    "create_default_tool_router",
]
