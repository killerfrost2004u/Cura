from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from src.core.entities.emergency import EmergencyTriggerSource
from src.presentation.api.dependencies import get_container, Container

router = APIRouter(prefix="/emergency", tags=["Emergency SOS"])

class EmergencyTriggerRequest(BaseModel):
    patient_id: str = "patient-001"
    source: EmergencyTriggerSource = EmergencyTriggerSource.HARDWARE_BUTTON
    latitude: Optional[float] = 30.0444
    longitude: Optional[float] = 31.2357
    notes: Optional[str] = "Mini CURA emergency button pressed"

@router.post("/trigger")
async def trigger_emergency(
    req: EmergencyTriggerRequest,
    container: Container = Depends(get_container),
):
    """
    FR-ALZ-011 & FR-HW-004: Emergency SOS broadcast endpoint.
    Invoked by hardware push button, voice panic trigger, or mobile 1-tap SOS.
    """
    event = await container.emergency_use_case.execute(
        patient_id=req.patient_id,
        source=req.source,
        latitude=req.latitude,
        longitude=req.longitude,
        notes=req.notes,
    )
    return {
        "status": "success",
        "data": {
            "emergency_id": event.id,
            "patient_id": event.patient_id,
            "source": event.source.value,
            "triggered_at": event.triggered_at.isoformat() + "Z",
            "location": {
                "lat": event.location.latitude if event.location else None,
                "lng": event.location.longitude if event.location else None,
            },
            "broadcast_status": "SENT_TO_ALL_CAREGIVERS",
        }
    }
