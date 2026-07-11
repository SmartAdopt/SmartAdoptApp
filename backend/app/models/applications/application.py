# Application model for MongoDB

from typing import Optional, List, Dict, Any
from datetime import datetime


class Application:
    # MongoDB model for adoption application

    def __init__(
        self,
        application_id: str,
        user_id: int,
        pet_profile_id: str,
        form_id: str,
        main_score: int,
        main_max_score: int,
        logistics_education_score: int,
        logistics_education_max_score: int,
        ai_justification: str,
        total_score: Optional[int] = None,
        total_max_score: Optional[int] = None,
        ai_breakdown: Optional[List[Dict[str, Any]]] = None,
        status: str = "pending",
        created_at: Optional[datetime] = None,
        needs_manual_review: bool = False,
    ):
        # Core identifiers
        self.application_id = application_id
        self.user_id = user_id
        self.pet_profile_id = pet_profile_id
        self.form_id = form_id

        # AI evaluation fields
        self.main_score = main_score
        self.main_max_score = main_max_score
        self.logistics_education_score = logistics_education_score
        self.logistics_education_max_score = logistics_education_max_score
        self.ai_justification = ai_justification
        self.total_score = total_score or main_score + logistics_education_score
        self.total_max_score = (
            total_max_score or main_max_score + logistics_education_max_score
        )
        self.ai_breakdown = ai_breakdown or []

        # AI evaluation flag
        self.needs_manual_review = needs_manual_review

        # Status and metadata
        self.status = status
        self.created_at = created_at or datetime.now()
