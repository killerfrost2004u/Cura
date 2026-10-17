from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional

class DoseStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    MISSED = "missed"
    SNOOZED = "snoozed"

@dataclass
class MedicationDose:
    id: str
    patient_id: str
    medication_name: str
    dosage: str
    scheduled_time: datetime
    instructions: str
    status: DoseStatus = DoseStatus.PENDING
    confirmed_at: Optional[datetime] = None
    voice_transcript: Optional[str] = None
    photo_url: Optional[str] = None
