from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

# Create the database engine using the connection URL from configuration.
engine = create_engine(settings.DATABASE_URL)

# Creates temporary "connections" for each request.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base for models (tables)
Base = declarative_base()


# Dependency to inject the session into your endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
