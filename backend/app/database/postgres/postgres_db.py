from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Logger import
from app.utils.logger.logger_config import logger

# Global engine variable (lazy initialization)
_engine = None


def get_engine():
    # Get or create the PostgreSQL engine (lazy initialization)
    global _engine
    if _engine is None:
        logger.info(
            f"Creating PostgreSQL engine for database: {settings.POSTGRES_DB} at {settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}"
        )
        _engine = create_engine(
            f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
        )
        logger.info("PostgreSQL engine created successfully")
    return _engine


# Creates temporary "connections" for each request.
def get_session_maker():
    # Get or create the session maker (lazy initialization)
    engine = get_engine()
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Base for models (tables)
Base = declarative_base()


# Dependency to inject the session into your endpoints
def get_db():
    logger.debug("Creating database session")
    SessionLocal = get_session_maker()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        logger.debug("Database session closed")
