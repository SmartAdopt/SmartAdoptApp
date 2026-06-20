from sqlalchemy import Column, Integer, ForeignKey, DateTime
from datetime import datetime
from ...database.postgres.postgres_db import Base


class Adopter(Base):

    # Table name in the database
    __tablename__ = "adopter"

    # Foreign key referencing the base user
    # Also serves as primary key for this table
    user_id = Column(
        Integer, ForeignKey("user.user_id", ondelete="CASCADE"), primary_key=True
    )

    # Creation date of the adopter record
    # Automatically set to the current date
    created_at = Column(DateTime, default=datetime.utcnow)
