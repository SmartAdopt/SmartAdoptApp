from sqlalchemy import Column, Integer, ForeignKey, DateTime
from datetime import datetime
from .user import User  # type: ignore[attr-defined]


class Adopter(User):

    # Table name in the database
    __tablename__ = "adopter"

    # Foreign key referencing the base user
    # Also serves as primary key for this table (inheritance)
    user_id = Column(
        Integer, ForeignKey("user.user_id", ondelete="CASCADE"), primary_key=True
    )

    # Creation date of the adopter record
    # Automatically set to the current date
    created_at = Column(DateTime, default=datetime.utcnow)

    # Mapper configuration to identify this class in polymorphism
    __mapper_args__ = {
        # Unique polymorphic identity for Adopter class
        "polymorphic_identity": "adopter"
    }
