from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger("cura.tools.adhd")

def create_adhd_tools(repo=None):
    """Factory to create ADHD scaffolding tools with bound repository."""

    async def decompose_adhd_task(
        task_title: str,
        patient_id: Optional[str] = None,
        context: str = ""
    ) -> Dict[str, Any]:
        """
        FR-ADHD-001: تفكيك المهام الكبيرة أو المعقدة إلى خطوة أولى ميكرو-إجرائية (Micro-step)
        تستغرق دقيقتين فقط لمنع الشلل التنفيذي (Executive Paralysis / Wall of Awful).
        """
        # Clinical micro-decomposition rules
        micro_step = f"افتح الملف واكتب عنوان: '{task_title}' في أول سطر فقط"
        if "مذاكرة" in task_title or "كتاب" in task_title or "قراءة" in task_title:
            micro_step = "افتح الصفحة الأولى واقرأ أول فقرة بس لمدة دقيقتين"
        elif "شغل" in task_title or "إيميل" in task_title or "تقرير" in task_title:
            micro_step = "افتح الإيميل أو المتصفح وجهز المسودة من غير ما تكتب أي حاجة معقدة"
        elif "ترتيب" in task_title or "غرفة" in task_title or "تنظيف" in task_title:
            micro_step = "شيل حاجة واحدة بس مش مكانها وحطها في مكانها الصح، وبس كدة"
        elif "رياضة" in task_title or "تمارين" in task_title:
            micro_step = "البس الكوتشي واشرب بق مية"

        # Save to database
        saved_task = None
        if repo and hasattr(repo, "add_adhd_task"):
            try:
                pid = patient_id or "22222222-2222-2222-2222-222222222222"
                saved_task = await repo.add_adhd_task(
                    title=f"{task_title} (خطوة 1)",
                    description=micro_step,
                    patient_id=pid,
                    target_pomodoros=1
                )
            except Exception as e:
                logger.error(f"Error registering ADHD micro-task: {e}")

        return {
            "original_task": task_title,
            "immediate_micro_step": micro_step,
            "estimated_minutes": 2,
            "db_task_id": saved_task.get("id") if saved_task else "mock-task-id",
            "coaching_instruction": "لا تذكر للمستخدم أكثر من هذه الخطوة الواحدة إطلاقاً! شجعه بحماس يبدأ دقيقتين بس."
        }

    async def get_adhd_tasks(
        patient_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        FR-ADHD-002: استعراض المهام الحالية وأرقام البومودورو المنجزة مع التركيز على المهمة الأولى فقط.
        """
        tasks = []
        if repo and hasattr(repo, "get_adhd_tasks"):
            try:
                pid = patient_id or "22222222-2222-2222-2222-222222222222"
                tasks = await repo.get_adhd_tasks(pid)
            except Exception as e:
                logger.error(f"Error fetching ADHD tasks: {e}")

        if not tasks:
            tasks = [
                {
                    "title": "مراجعة تقرير المشروع",
                    "description": "قراءة أول فقرة بس",
                    "status": "PENDING",
                    "target_pomodoros": 2,
                    "completed_pomodoros": 0
                }
            ]

        # Prioritize top task
        current_focus = tasks[0] if tasks else None
        return {
            "total_tasks_count": len(tasks),
            "current_focus_task": current_focus,
            "all_tasks": tasks,
            "coaching_instruction": "ركز انتباه المستخدم على مهمة التركيز الحالية فقط، ولا تشتته بالباقي."
        }

    async def complete_adhd_task(
        task_id: str,
        patient_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        FR-ADHD-003: تسجيل إتمام المهمة في Neon وإرسال دفعة دوبامين كلامية إيجابية.
        """
        success = True
        if repo and hasattr(repo, "complete_adhd_task"):
            try:
                success = await repo.complete_adhd_task(task_id)
            except Exception as e:
                logger.error(f"Error completing ADHD task: {e}")

        return {
            "task_id": task_id,
            "status": "COMPLETED",
            "dopamine_reward": "عاش يا بطل! خطوة ممتازة جداً وخلصتها في وقت قياسي. استمتع بدقيقة راحة نفس عميق!",
            "next_suggestion": "تحب ناخد بريك دقيقتين ونشرب مية، ولا نكمل على الخطوة اللي بعدها بحماس؟"
        }

    return decompose_adhd_task, get_adhd_tasks, complete_adhd_task
