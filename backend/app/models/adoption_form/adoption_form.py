from typing import Optional, List
from datetime import datetime


class AdoptionForm:
    # MongoDB model for adoption form

    def __init__(
        self,
        user_id: int,
        # I. Candidate Information
        neighborhood: str,
        address: str,
        employment_status: str,
        housing_type: str,
        has_natural_space: bool,
        # II. Coexistence and Experience
        has_pets: bool,
        household_energy: str,
        has_children: bool,
        long_term_commitment: bool,
        # III. Pet Preferences
        preferred_species: str,
        preferred_gender: str,
        preferred_energy: str,
        # IV. Logistics and Education
        daily_time_dedication: int,
        sleeping_location: str,
        behavior_approach: str,
        emergency_plan: str,
        # V. Final Motivation
        motivation: str,
        # Optional fields
        employment_status_other: Optional[str] = None,
        housing_type_other: Optional[str] = None,
        current_pets_details: Optional[str] = None,
        children_ages: Optional[List[int]] = None,
        sleeping_location_other: Optional[str] = None,
        behavior_approach_other: Optional[str] = None,
        emergency_plan_other: Optional[str] = None,
        # Metadata
        submission_date: Optional[datetime] = None,
        last_updated: Optional[datetime] = None,
    ):
        # User reference (PostgreSQL User.user_id)
        self.user_id = user_id

        # I. Candidate Information
        self.neighborhood = neighborhood
        self.address = address
        self.employment_status = employment_status
        self.employment_status_other = employment_status_other
        self.housing_type = housing_type
        self.housing_type_other = housing_type_other
        self.has_natural_space = has_natural_space

        # II. Coexistence and Experience
        self.has_pets = has_pets
        self.current_pets_details = current_pets_details
        self.household_energy = household_energy
        self.has_children = has_children
        self.children_ages = children_ages
        self.long_term_commitment = long_term_commitment

        # III. Pet Preferences
        self.preferred_species = preferred_species
        self.preferred_gender = preferred_gender
        self.preferred_energy = preferred_energy

        # IV. Logistics and Education
        self.daily_time_dedication = daily_time_dedication
        self.sleeping_location = sleeping_location
        self.sleeping_location_other = sleeping_location_other
        self.behavior_approach = behavior_approach
        self.behavior_approach_other = behavior_approach_other
        self.emergency_plan = emergency_plan
        self.emergency_plan_other = emergency_plan_other

        # V. Final Motivation
        self.motivation = motivation

        # Metadata
        self.submission_date = submission_date or datetime.now()
        self.last_updated = last_updated or datetime.now()
