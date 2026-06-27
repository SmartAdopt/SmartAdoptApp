from datetime import datetime
from typing import Optional
from app.models.pet.pet import Pet


class PetProfile:
    def __init__(
        self,
        id: str,
        title: str,
        tags: list,
        emotional_description: str,
        pet: Pet,
        status: str = "available",
        creation_date: Optional[datetime] = None,
    ):
        self.id = id
        self.title = title
        self.tags = tags
        self.emotional_description = emotional_description
        self.pet = pet
        self.status = status
        self.creation_date = creation_date or datetime.now()
