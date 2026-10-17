from typing import Tuple
from src.core.interfaces.repositories import IPatientRepository

class TrackQuestionRepetitionUseCase:
    """
    Alzheimer Care: Logs questions and detects repetition frequency (FR-ALZ-001).
    Ensures CURA responds naturally without indicating annoyance to the user.
    """
    def __init__(self, patient_repo: IPatientRepository):
        self._repo = patient_repo

    async def execute(self, patient_id: str, question_text: str, intent_name: str) -> Tuple[int, bool]:
        """
        Logs question and returns:
        (repetition_count_in_24h, is_repeated)
        """
        count = await self._repo.log_question(patient_id, question_text, intent_name)
        is_repeated = count > 1
        return count, is_repeated
