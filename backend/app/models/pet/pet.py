from typing import List


class Pet:
    def __init__(
        self,
        id: str,
        name: str,
        pet_image_url: str,
        animal_breed: List[str],
        age: int,
        gender: str,
        is_sterilized: bool,
        vaccines_up_to_date: List[str],
        dewormed: bool,
        weight_kg: float,
        special_conditions: List[str],
        brief_description: str,
    ):
        self.id = id
        self.name = name
        self.pet_image_url = pet_image_url
        self.animal_breed = animal_breed
        self.age = age
        self.gender = gender
        self.is_sterilized = is_sterilized
        self.vaccines_up_to_date = vaccines_up_to_date
        self.dewormed = dewormed
        self.weight_kg = weight_kg
        self.special_conditions = special_conditions
        self.brief_description = brief_description
