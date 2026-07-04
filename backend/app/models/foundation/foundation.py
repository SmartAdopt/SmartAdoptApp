from sqlalchemy import Column, Integer, String
from ...database.postgres.postgres_db import Base


class Foundation(Base):

    __tablename__ = "foundation"

    foundation_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    email = Column(String, nullable=False)
    legal_representative = Column(String, nullable=False)
    business_hours = Column(String, nullable=False)
