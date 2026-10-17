from typing import Optional, Dict, Any
from datetime import datetime
import uuid
from src.core.entities.emergency import EmergencyEvent, EmergencyTriggerSource, GeoLocation
from src.core.interfaces.repositories import IEmergencyRepository

class HandleEmergencyAlertUseCase:
    """
    Handles immediate emergency triggers from the physical button or voice keywords.
    (FR-ALZ-011, FR-HW-004)
    """
    def __init__(self, emergency_repo: IEmergencyRepository):
        self._repo = emergency_repo

    async def execute(
        self,
        patient_id: str,
        source: EmergencyTriggerSource,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        notes: Optional[str] = None,
    ) -> EmergencyEvent:
        location = None
        if latitude is not None and longitude is not None:
            location = GeoLocation(latitude=latitude, longitude=longitude)

        event = EmergencyEvent(
            id=str(uuid.uuid4()),
            patient_id=patient_id,
            source=source,
            triggered_at=datetime.utcnow(),
            location=location,
            is_resolved=False,
            notes=notes,
        )
        saved_event = await self._repo.create_emergency_event(event)
        return saved_event
