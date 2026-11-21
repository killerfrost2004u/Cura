from typing import Optional
from .tool_router_impl import ToolRouterImpl
from .web_search_tool import search_duckduckgo
from .weather_tool import get_current_weather
from .patient_summary_tool import create_patient_summary_tool, get_caregiver_patient_summary
from .medication_tools import create_medication_tools
from .memory_tools import create_memory_tools
from .adhd_tools import create_adhd_tools

def create_default_tool_router(repo=None) -> ToolRouterImpl:
    router = ToolRouterImpl()

    # Instantiate bound or fallback tool handlers
    lookup_meds_fn, confirm_meds_fn = create_medication_tools(repo)
    lookup_family_fn, lookup_item_fn = create_memory_tools(repo)
    decompose_task_fn, get_adhd_tasks_fn, complete_task_fn = create_adhd_tools(repo)
    caregiver_summary_fn = create_patient_summary_tool(repo)

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
        description="البحث المباشر على الإنترنت عن أحدث الأخبار، الأبحاث الطبية والعلمية، المعلومات العامة، أو أي استفسار يتطلب بيانات محدثة من الويب.",
        parameters={
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "كلمات البحث باللغة العربية أو الإنجليزية."}
            },
            "required": ["query"]
        },
        handler=search_duckduckgo,
    )

    # 3. Patient Caregiver Summary Tool (Neon PostgreSQL Aggregation)
    router.register_tool(
        name="get_caregiver_patient_summary",
        description="استخراج ملخص حالة المريض لآخر يومين لأهله أو للطبيب من قاعدة البيانات (مواعيد الدواء، تكرار الأسئلة، المهام).",
        parameters={
            "type": "object",
            "properties": {
                "days": {"type": "integer", "description": "عدد الأيام المطلوب تلخيصها، الافتراضي 2."},
                "patient_id": {"type": "string", "description": "معرف المريض (اختياري)."}
            },
            "required": []
        },
        handler=caregiver_summary_fn,
    )

    # 4. Medication Dose Confirmation Tool
    router.register_tool(
        name="confirm_medication_dose",
        description="تأكيد أخذ جرعة الدواء صوتياً أو يدوياً وتسجيلها في قاعدة بيانات Neon وإشعار الأهل والمرافقين.",
        parameters={
            "type": "object",
            "properties": {
                "status": {"type": "string", "enum": ["taken", "missed"], "description": "حالة الجرعة (taken أو missed)."},
                "note": {"type": "string", "description": "ملاحظات إضافية أو تأكيد صوتي من المريض."},
                "dose_id": {"type": "string", "description": "معرف الجرعة (اختياري)."}
            },
            "required": ["status"]
        },
        handler=confirm_meds_fn,
    )

    # 5. Lookup Medications Tool (Alzheimer / Medical Care)
    router.register_tool(
        name="lookup_medications",
        description="الاستعلام عن قائمة الأدوية المجدولة للمريض مع وصفها الحسي ومواعيدها وتعليمات تناولها.",
        parameters={
            "type": "object",
            "properties": {
                "patient_id": {"type": "string", "description": "معرف المريض (اختياري)."}
            },
            "required": []
        },
        handler=lookup_meds_fn,
    )

    # 6. Lookup Family Memory Tool (Alzheimer Memory Book)
    router.register_tool(
        name="lookup_family_memory",
        description="استرجاع معلومات أفراد العائلة والأبناء من دفتر الذكريات (Memory Book) لطمأنة مريض الزهايمر عند نسيانهم أو السؤال عنهم.",
        parameters={
            "type": "object",
            "properties": {
                "relation_or_name": {"type": "string", "description": "اسم الشخص أو صلته بالمريض، مثل أحمد أو ابني أو بنتي."}
            },
            "required": []
        },
        handler=lookup_family_fn,
    )

    # 7. Lookup Item Location Tool (Alzheimer Misplaced Objects)
    router.register_tool(
        name="lookup_item_location",
        description="البحث عن مكان المتعلقات الشخصية المفقودة للمريض (المفاتيح، النظارة، المحفظة، السبحة).",
        parameters={
            "type": "object",
            "properties": {
                "item_name": {"type": "string", "description": "اسم الشيء المفقود مثل المفاتيح أو النظارة."}
            },
            "required": ["item_name"]
        },
        handler=lookup_item_fn,
    )

    # 8. Decompose ADHD Task Tool (ADHD Executive Functioning)
    router.register_tool(
        name="decompose_adhd_task",
        description="تفكيك مهمة كبيرة أو مسببة للإرهاق والتسويف إلى خطوة أولى ميكرو-إجرائية لا تستغرق أكثر من دقيقتين لمنع الشلل التنفيذي.",
        parameters={
            "type": "object",
            "properties": {
                "task_title": {"type": "string", "description": "اسم المهمة الكبيرة المراد البدء فيها."},
                "context": {"type": "string", "description": "سياق إضافي للمهمة إن وجد."}
            },
            "required": ["task_title"]
        },
        handler=decompose_task_fn,
    )

    # 9. Get ADHD Tasks Tool
    router.register_tool(
        name="get_adhd_tasks",
        description="استعراض قائمة مهام التركيز وجلسات البومودورو لمريض الـ ADHD مع تسليط الضوء على المهمة الحالية فقط.",
        parameters={
            "type": "object",
            "properties": {
                "patient_id": {"type": "string", "description": "معرف المريض (اختياري)."}
            },
            "required": []
        },
        handler=get_adhd_tasks_fn,
    )

    # 10. Complete ADHD Task Tool
    router.register_tool(
        name="complete_adhd_task",
        description="تسجيل إنجاز مهمة التركيز الحالية وإرسال مكافأة دوبامين كلامية إيجابية للمستخدم.",
        parameters={
            "type": "object",
            "properties": {
                "task_id": {"type": "string", "description": "معرف المهمة المنجزة."}
            },
            "required": ["task_id"]
        },
        handler=complete_task_fn,
    )

    return router

__all__ = [
    "ToolRouterImpl",
    "search_duckduckgo",
    "get_current_weather",
    "get_caregiver_patient_summary",
    "create_default_tool_router",
]
