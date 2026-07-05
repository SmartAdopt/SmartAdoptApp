# Favorite model for tracking user favorites

# SQLAlchemy imports
from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint

# Base model import
from ...database.postgres.postgres_db import Base


class Favorite(Base):

    # Table name in the database
    __tablename__ = "favorite"

    # Unique favorite identifier (primary key with index)
    favorite_id = Column(Integer, primary_key=True, index=True)

    # User who favorited the pet (foreign key to user table with cascade delete)
    user_id = Column(
        Integer, ForeignKey("user.user_id", ondelete="CASCADE"), nullable=False
    )

    # Pet profile ID referencing MongoDB pet_profiles collection
    pet_profile_id = Column(String, nullable=False)

    # Unique constraint preventing duplicate favorites per user
    __table_args__ = (
        UniqueConstraint("user_id", "pet_profile_id", name="uq_user_pet_favorite"),
    )
