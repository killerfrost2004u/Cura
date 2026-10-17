from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from src.core.interfaces.repositories import IPatientRepository, IMedicationRepository, IEmergencyRepository
from src.core.entities.medication import MedicationDose, DoseStatus
from src.core.entities.emergency import EmergencyEvent

class InMemoryRepository(IPatientRepository, IMedicationRepository, IEmergencyRepository):
    """
    Zero-config in-memory repository for local development, unit tests, and fast prototyping.
    """
    def __init__(self):
        self._item_locations: Dict[str, Dict[str, str]] = {}
        self._question_logs: Dict[str, List[Dict[str, Any]]] = {}
        self._medications: Dict[str, List[MedicationDose]] = {}
        self._emergencies: List[EmergencyEvent] = []

        # Seed sample data for testing
        self._seed_sample_data()

    def _seed_sample_data(self):
        sample_patient = "patient-001"
        self._item_locations[sample_patient] = {
            "المفاتيح": "على طاولة المدخل بجانب الباب",
            "النظارة": "على كومودينو غرفة النوم",
            "المحفظة": "في جيب الجاكيت المعلق بالدولاب",
        }
        self._medications[sample_patient] = [
            MedicationDose(
                id="dose-101",
                patient_id=sample_patient,
                medication_name="دواء ضغط الدم (كونكور 5 مجم)",
                dosage="قرص واحد",
                scheduled_time=datetime.utcnow() + timedelta(hours=1),
                instructions="يؤخذ بعد وجبة الإفطار مع كوب ماء",
                status=DoseStatus.PENDING,
            ),
            MedicationDose(
                id="dose-102",
                patient_id=sample_patient,
                medication_name="فيتامين د",
                dosage="كبسولة واحدة",
                scheduled_time=datetime.utcnow() - timedelta(hours=3),
                instructions="بعد الغداء مباشرة",
                status=DoseStatus.CONFIRMED,
                confirmed_at=datetime.utcnow() - timedelta(hours=2, minutes=50),
            ),
        ]

    # --- IPatientRepository ---
    async def get_patient_summary(self, patient_id: str, days: int = 2) -> Dict[str, Any]:
        return {
            "patient_id": patient_id,
            "period_days": days,
            "medications_taken": 4,
            "medications_total": 4,
            "repeated_questions_count": 2,
            "tasks_completed": 5,
            "emergency_events_count": len([e for e in self._emergencies if e.patient_id == patient_id]),
        }

    async def log_question(self, patient_id: str, question: str, intent: str) -> int:
        if patient_id not in self._question_logs:
            self._question_logs[patient_id] = []
        
        now = datetime.utcnow()
        self._question_logs[patient_id].append({
            "question": question,
            "intent": intent,
            "time": now,
        })
        
        # Count identical question occurrences within last 24h
        cutoff = now - timedelta(hours=24)
        count = sum(
            1 for entry in self._question_logs[patient_id]
            if entry["question"].strip() == question.strip() and entry["time"] >= cutoff
        )
        return count

    async def get_stored_item_location(self, patient_id: str, item_name: str) -> Optional[str]:
        patient_items = self._item_locations.get(patient_id, {})
        for stored_key, location in patient_items.items():
            if stored_key in item_name or item_name in stored_key:
                return location
        return None

    async def set_stored_item_location(self, patient_id: str, item_name: str, location: str) -> None:
        if patient_id not in self._item_locations:
            self._item_locations[patient_id] = {}
        self._item_locations[patient_id][item_name] = location

    # --- IMedicationRepository ---
    async def get_pending_doses(self, patient_id: str) -> List[MedicationDose]:
        all_doses = self._medications.get(patient_id, [])
        return [d for d in all_doses if d.status == DoseStatus.PENDING]

    async def confirm_dose(self, dose_id: str, transcript: str) -> bool:
        for p_id, doses in self._medications.items():
            for d in doses:
                if d.id == dose_id:
                    d.status = DoseStatus.CONFIRMED
                    d.confirmed_at = datetime.utcnow()
                    d.voice_transcript = transcript
                    return True
        return False

    # --- IEmergencyRepository ---
    async def create_emergency_event(self, event: EmergencyEvent) -> EmergencyEvent:
        self._emergencies.append(event)
        return event
