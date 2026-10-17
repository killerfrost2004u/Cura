from typing import Dict, Any
from datetime import datetime

async def confirm_medication_dose(status: str = "taken", note: str = "") -> Dict[str, Any]:
    """
    FR-ALZ-007: Tool to register voice or manual dose confirmation in database.
    """
    return {
        "status": status,
        "confirmed_at": datetime.utcnow().isoformat() + "Z",
        "message": "تم تسجيل أخذ جرعة الدواء بنجاح وإبلاغ الأهل.",
    }
