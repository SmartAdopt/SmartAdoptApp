# Import user models for database ORM
from .user import User
from .admin import Admin
from .adopter import Adopter

# Export all user models
__all__ = ["User", "Admin", "Adopter"]
