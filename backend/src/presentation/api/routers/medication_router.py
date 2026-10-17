from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from src.presentation.api.dependencies import get_container, Container

router = APIRouter(prefix="/medications", tags=["Medications"])

class ConfirmDoseRequest(BaseModel):
    status: str = "taken"
    transcript: Optional[str] = "أخدت الدواء خلاص"

@router.get("/{patient_id}/pending")
async def get_pending_medications(
    patient_id: str,
    container: Container = Depends(get_container),
):
    """FR-ALZ-006: Fetch pending doses for reminder cards on 4\" screen & mobile."""
    doses = await container.repo.get_pending_doses(patient_id)
    return {
        "status": "success",
        "data": [
            {
                "id": d.id,
                "name": d.medication_name,
                "dosage": d.dosage,
                "instructions": d.instructions,
                "scheduled_time": d.scheduled_time.isoformat() + "Z",
                "status": d.status.value,
            }
            for d in doses
        ]
    }

@router.post("/{dose_id}/confirm")
async def confirm_medication_dose(
    dose_id: str,
    req: ConfirmDoseRequest,
    container: Container = Depends(get_container),
):
    """FR-ALZ-007: Register dose confirmation via voice or mobile button."""
    success = await container.repo.confirm_dose(dose_id=dose_id, transcript=req.transcript)
    if not success:
        raise HTTPException(status_code=404, detail=f"Dose '{dose_id}' not found.")
    
    return {
        "status": "success",
        "data": {
            "dose_id": dose_id,
            "status": "confirmed",
            "message": "تم تأكيد أخذ الجرعة بنجاح وإشعار رعاية المريض.",
        }
    }
