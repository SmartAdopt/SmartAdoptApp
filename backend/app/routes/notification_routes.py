from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from app.database.mongo.mongo_db import get_mongo_db
from app.utils.jwt.jwt_utils import verify_token
from app.schemas.notification_schemas import (
    NotificationListResponse,
    NotificationResponse,
    UnreadCountResponse,
)
from app.services.notification_service import (
    get_notifications_by_user,
    get_unread_count,
    mark_notification_read,
    mark_all_read,
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
async def get_notifications(
    db: Any = Depends(get_mongo_db), token_payload: dict = Depends(verify_token)
):
    user_id_str = token_payload.get("sub")
    role = token_payload.get("role")
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = int(user_id_str)
    if role != "adopter":
        raise HTTPException(
            status_code=403, detail="Only adopters can access notifications"
        )

    notifications = await get_notifications_by_user(db, user_id)
    unread_count = sum(1 for n in notifications if not n.get("read"))

    return NotificationListResponse(
        notifications=[NotificationResponse(**n) for n in notifications],
        count=len(notifications),
        unread_count=unread_count,
    )


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count_route(
    db: Any = Depends(get_mongo_db), token_payload: dict = Depends(verify_token)
):
    user_id_str = token_payload.get("sub")
    role = token_payload.get("role")
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = int(user_id_str)
    if role != "adopter":
        raise HTTPException(
            status_code=403, detail="Only adopters can access notifications"
        )

    count = await get_unread_count(db, user_id)
    return UnreadCountResponse(count=count)


@router.put("/{notification_id}/read")
async def mark_read_route(
    notification_id: str,
    db: Any = Depends(get_mongo_db),
    token_payload: dict = Depends(verify_token),
):
    user_id_str = token_payload.get("sub")
    role = token_payload.get("role")
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = int(user_id_str)
    if role != "adopter":
        raise HTTPException(
            status_code=403, detail="Only adopters can access notifications"
        )

    success = await mark_notification_read(db, notification_id, user_id)
    if not success:
        raise HTTPException(
            status_code=404, detail="Notification not found or already read"
        )

    return {"message": "Notification marked as read"}


@router.put("/read-all")
async def mark_all_read_route(
    db: Any = Depends(get_mongo_db), token_payload: dict = Depends(verify_token)
):
    user_id_str = token_payload.get("sub")
    role = token_payload.get("role")
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = int(user_id_str)
    if role != "adopter":
        raise HTTPException(
            status_code=403, detail="Only adopters can access notifications"
        )

    await mark_all_read(db, user_id)
    return {"message": "All notifications marked as read"}
