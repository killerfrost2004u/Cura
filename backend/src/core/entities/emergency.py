from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional

class EmergencyTriggerSource(str, Enum):
    HARDWARE_BUTTON = "hardware_button"  # Physical push button on Mini CURA
    VOICE_KEYWORD = "voice_keyword"      # "إلحقوني" / "ساعدني يا كيورا"
    GEOFENCE_BREACH = "geofence_breach"  # Wandering patient outside safe perimeter
    MANUAL_APP = "manual_app"            # 1-tap SOS in GUI or Mobile

@dataclass
class GeoLocation:
    latitude: float
    longitude: float
    accuracy_meters: Optional[float] = None
    address_label: Optional[str] = None

@dataclass
class EmergencyEvent:
    id: str
    patient_id: str
    source: EmergencyTriggerSource
    triggered_at: datetime
    location: Optional[GeoLocation] = None
    is_resolved: bool = False
    resolved_at: Optional[datetime] = None
    notes: Optional[str] = None
