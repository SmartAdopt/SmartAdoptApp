from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.postgres.postgres_db import get_db
from app.database.mongo.mongo_db import get_mongo_db
from app.schemas.foundation_schemas import (
    FoundationCreateRequest,
    FoundationUpdateRequest,
    FoundationCreateResponse,
    FoundationUpdateResponse,
    FoundationResponse,
)
from app.services.foundation_service import (
    create_foundation,
    get_foundation,
    update_foundation,
)
from app.utils.jwt.jwt_utils import verify_token
from app.utils.logger.logger_config import logger
from app.utils.cache_utils import get_cached_data, set_cached_data, invalidate_cache

router = APIRouter(prefix="/foundation", tags=["Foundation"])


@router.post(
    "/", response_model=FoundationCreateResponse, status_code=status.HTTP_201_CREATED
)
async def create_foundation_endpoint(
    data: FoundationCreateRequest,
    db: Session = Depends(get_db),
    mongo_db=Depends(get_mongo_db),
    token_payload: dict = Depends(verify_token),
):
    user_role = token_payload.get("role", "").lower()
    if user_role != "admin":
        logger.warning(f"Access denied for user role: {user_role}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Access denied. Admin role required"},
        )

    try:
        foundation = create_foundation(db, data.model_dump())

        # Send notifications to users with approved applications
        try:
            from app.services.notification_service import create_notification

            applications = (
                await mongo_db["applications"]
                .find({"status": "approved"})
                .to_list(None)
            )
            for app in applications:
                await create_notification(
                    mongo_db,
                    app["user_id"],
                    "Datos de Fundación Disponibles",
                    "La fundación acaba de configurar su información de contacto. Entra a tus solicitudes aprobadas para ver cómo contactarlos.",
                    app["_id"],
                    "info",
                )
        except Exception as notif_e:
            logger.warning(f"Could not send foundation notifications: {notif_e}")

        # Invalidate foundation cache
        invalidate_cache("cache:foundation")

        return FoundationCreateResponse(
            message="Foundation created successfully",
            foundation_id=int(foundation.foundation_id),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": str(e)},
        )
    except Exception as e:
        logger.error(f"Foundation creation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )


@router.get("/", response_model=FoundationResponse)
def get_foundation_endpoint(
    db: Session = Depends(get_db),
):
    try:
        cache_key = "cache:foundation"
        cached_response = get_cached_data(cache_key)
        if cached_response:
            return cached_response

        foundation = get_foundation(db)

        # Serialize response using Pydantic model for cache
        response_model = FoundationResponse.model_validate(foundation)
        set_cached_data(cache_key, response_model, expire_seconds=3600)

        return foundation
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": str(e)},
        )
    except Exception as e:
        logger.error(f"Foundation retrieval error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )


@router.put("/", response_model=FoundationUpdateResponse)
async def update_foundation_endpoint(
    data: FoundationUpdateRequest,
    db: Session = Depends(get_db),
    mongo_db=Depends(get_mongo_db),
    token_payload: dict = Depends(verify_token),
):
    user_role = token_payload.get("role", "").lower()
    if user_role != "admin":
        logger.warning(f"Access denied for user role: {user_role}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Access denied. Admin role required"},
        )

    try:
        foundation = update_foundation(db, data.model_dump(exclude_none=True))

        # Send notifications to users with approved applications
        try:
            from app.services.notification_service import create_notification

            applications = (
                await mongo_db["applications"]
                .find({"status": "approved"})
                .to_list(None)
            )
            for app in applications:
                await create_notification(
                    mongo_db,
                    app["user_id"],
                    "Datos de Fundación Actualizados",
                    "La fundación ha actualizado su información de contacto. Entra a tus solicitudes aprobadas para ver los nuevos detalles.",
                    app["_id"],
                    "info",
                )
        except Exception as notif_e:
            logger.warning(f"Could not send foundation notifications: {notif_e}")

        # Invalidate foundation cache
        invalidate_cache("cache:foundation")

        return FoundationUpdateResponse(
            message="Foundation updated successfully",
            foundation_id=int(foundation.foundation_id),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": str(e)},
        )
    except Exception as e:
        logger.error(f"Foundation update error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"},
        )
