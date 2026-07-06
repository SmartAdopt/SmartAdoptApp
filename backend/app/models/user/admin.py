from sqlalchemy import Column, Integer, ForeignKey
from ...database.postgres.postgres_db import Base


class Admin(Base):

    # Table name in the database
    __tablename__ = "admin"

    # Foreign key referencing the base user
    # Also serves as primary key for this table
    user_id = Column(
        Integer, ForeignKey("user.user_id", ondelete="CASCADE"), primary_key=True
    )
