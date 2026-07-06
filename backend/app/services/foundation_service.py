from sqlalchemy.orm import Session
from app.models.foundation.foundation import Foundation
from typing import Dict, Any
from app.utils.logger.logger_config import logger


def create_foundation(db: Session, data: Dict[str, Any]) -> Foundation:
    existing = db.query(Foundation).first()
    if existing:
        logger.warning("Foundation creation failed - already exists")
        raise ValueError("Foundation already exists")

    foundation = Foundation(**data)
    db.add(foundation)
    db.commit()
    db.refresh(foundation)
    logger.info(f"Foundation created: {foundation.name}")
    return foundation


def get_foundation(db: Session) -> Foundation:
    foundation = db.query(Foundation).first()
    if not foundation:
        logger.warning("Foundation not found")
        raise ValueError("Foundation not found")
    return foundation


def update_foundation(db: Session, data: Dict[str, Any]) -> Foundation:
    foundation = db.query(Foundation).first()
    if not foundation:
        logger.info("Foundation not found, creating a new one on PUT")
        foundation = Foundation(**data)
        db.add(foundation)
    else:
        for key, value in data.items():
            if value is not None:
                setattr(foundation, key, value)

    db.commit()
    db.refresh(foundation)
    logger.info(f"Foundation updated/created: {foundation.name}")
    return foundation
