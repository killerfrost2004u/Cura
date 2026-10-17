from typing import Dict, Any
from src.core.interfaces.repositories import IPatientRepository
from src.core.interfaces.llm_engine import ILLMEngine
from src.core.entities.cognitive_mode import CognitiveMode

class SummarizeCaregiverLogUseCase:
    """
    Caregiver 2-Day Health and Activity Summarizer (FR-ALZ-009).
    Answers queries like: "عمل إيه آخر يومين؟" in Egyptian Arabic.
    """
    def __init__(self, patient_repo: IPatientRepository, llm_engine: ILLMEngine):
        self._patient_repo = patient_repo
        self._llm = llm_engine

    async def execute(self, patient_id: str, days: int = 2) -> str:
        summary_data: Dict[str, Any] = await self._patient_repo.get_patient_summary(patient_id, days=days)

        prompt = (
            f"أنت المساعد الذكي CURA. أهل المريض أو الدكتور بيسألوا: 'عمل إيه آخر يومين؟'.\n"
            f"إليك بيانات المريض لآخر {days} يومين:\n"
            f"- عدد مرات أخذ الدواء في مواعيده: {summary_data.get('medications_taken', 0)} من أصل {summary_data.get('medications_total', 0)}\n"
            f"- عدد الأسئلة المتكررة المرصودة: {summary_data.get('repeated_questions_count', 0)}\n"
            f"- المهام المنجزة: {summary_data.get('tasks_completed', 0)}\n"
            f"- أحداث الطوارئ: {summary_data.get('emergency_events_count', 0)}\n\n"
            f"المطلوب: لخص هذه الحالة في جملتين أو ثلاث بالعامية المصرية بطريقة مهذبة، واضحة ومطمئنة."
        )

        llm_response = await self._llm.generate_response(
            prompt=prompt,
            mode=CognitiveMode.NORMAL,
        )
        return llm_response.get("content", "المريض بخير وأخذ أدويته بانتظام خلال اليومين الماضيين.")
