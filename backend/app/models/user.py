
from sqlalchemy import Column, Integer, String
from ..database.postgres.postgres_db import Base


class User(Base):

    
    # Table name in the database
    __tablename__ = "user"
    
    # Unique user identifier (primary key with index)
    user_id = Column(Integer, primary_key=True, index=True)
    
    # User's first name (cannot be null)
    first_name = Column(String, nullable=False)
    
    # User's last name (cannot be null)
    last_name = Column(String, nullable=False)
    
    # User's email address (unique, indexed, cannot be null)
    email = Column(String, unique=True, index=True, nullable=False)
    
    # User's phone number (optional, can be null)
    phone_number = Column(String, nullable=True)
    
    # User's password hash (cannot be null)
    password_hash = Column(String, nullable=False)
    
    # Field to identify user type (polymorphism)
    # This field allows SQLAlchemy to distinguish between different subclasses
    type = Column(String(50))
    
    # Mapper configuration to enable polymorphism
    __mapper_args__ = {
        # Polymorphic identity for the base class
        'polymorphic_identity': 'user',
        # Field used to determine the instance type
        'polymorphic_on': type
    }
