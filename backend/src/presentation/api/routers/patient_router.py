from fastapi import APIRouter, Depends, Query
from typing import Optional
from src.presentation.api.dependencies import get_container, Container

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/{patient_id}/summary")
async def get_patient_summary(
    patient_id: str,
    days: int = Query(default=2, ge=1, le=14),
    container: Container = Depends(get_container),
):
    """
    FR-ALZ-009: Caregiver/Doctor 2-day activity report.
    Returns structured metrics and AI-generated narrative in Egyptian Arabic.
    """
    narrative = await container.summarize_use_case.execute(patient_id=patient_id, days=days)
    metrics = await container.repo.get_patient_summary(patient_id=patient_id, days=days)

    return {
        "status": "success",
        "data": {
            "patient_id": patient_id,
            "days": days,
            "spoken_summary_arabic": narrative,
            "metrics": metrics,
        }
    }
