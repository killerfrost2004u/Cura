from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import datetime
from ..entities.medication import MedicationDose, DoseStatus
from ..entities.emergency import EmergencyEvent

class IPatientRepository(ABC):
    """Data access abstraction for patient profile and activity logs."""
    @abstractmethod
    async def get_patient_summary(self, patient_id: str, days: int = 2) -> Dict[str, Any]:
        """Fetch 2-day activity summary (FR-ALZ-009)."""
        pass

    @abstractmethod
    async def log_question(self, patient_id: str, question: str, intent: str) -> int:
        """Log patient question and return repetition count in the last 24h (FR-ALZ-001)."""
        pass

    @abstractmethod
    async def get_stored_item_location(self, patient_id: str, item_name: str) -> Optional[str]:
        """Fetch last known location of an item (FR-ALZ-003)."""
        pass

    @abstractmethod
    async def set_stored_item_location(self, patient_id: str, item_name: str, location: str) -> None:
        """Store location of an item."""
        pass

class IMedicationRepository(ABC):
    """Data access abstraction for scheduled medications."""
    @abstractmethod
    async def get_pending_doses(self, patient_id: str) -> List[MedicationDose]:
        """Fetch upcoming or pending medication doses."""
        pass

    @abstractmethod
    async def confirm_dose(self, dose_id: str, transcript: str) -> bool:
        """Confirm medication was taken (FR-ALZ-007)."""
        pass

class IEmergencyRepository(ABC):
    """Data access abstraction for SOS emergencies."""
    @abstractmethod
    async def create_emergency_event(self, event: EmergencyEvent) -> EmergencyEvent:
        """Log critical SOS event (FR-ALZ-011, FR-HW-004)."""
        pass
