from sqlalchemy import Column, Integer, ForeignKey
from .user import User  # type: ignore[attr-defined]


class Admin(User):

    # Table name in the database
    __tablename__ = "admin"

    # Foreign key referencing the base user
    # Also serves as primary key for this table (inheritance)
    user_id = Column(
        Integer, ForeignKey("user.user_id", ondelete="CASCADE"), primary_key=True
    )

    # Mapper configuration to identify this class in polymorphism
    __mapper_args__ = {
        # Unique polymorphic identity for Admin class
        "polymorphic_identity": "admin"
    }
