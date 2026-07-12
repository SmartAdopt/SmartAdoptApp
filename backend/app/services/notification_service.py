from datetime import datetime
from typing import List, Dict, Any, Optional
from app.utils.logger.logger_config import logger
from app.utils.socketio_manager import sio


async def get_next_sequence(db, collection_name: str, counter_name: str) -> int:
    try:
        counters_collection = db[collection_name]
        result = await counters_collection.find_one_and_update(
            {"_id": counter_name},
            {"$inc": {"sequence_value": 1}},
            upsert=True,
            return_document=True,
        )
        if result:
            return result.get("sequence_value", 1)
        return 1
    except Exception as e:
        logger.error(f"Failed to get next sequence for {counter_name}: {str(e)}")
        raise


async def create_notification(
    db,
    user_id: int,
    titulo: str,
    descripcion: str,
    application_id: Optional[str] = None,
    tipo: Optional[str] = None,
) -> Dict[str, Any]:
    logger.info(f"Creating notification for user_id: {user_id}")
    try:
        sequence = await get_next_sequence(db, "counters", "notification_counter")
        notification_id = f"NOTIF{sequence}"

        notification_doc: Dict[str, Any] = {
            "_id": notification_id,
            "user_id": user_id,
            "titulo": titulo,
            "descripcion": descripcion,
            "fecha": datetime.now(),
            "read": False,
            "application_id": application_id,
            "tipo": tipo,
        }

        await db["notifications"].insert_one(notification_doc)

        # Emit realtime notification to the specific user room
        await sio.emit(
            "new_notification",
            {
                "notification_id": notification_doc["_id"],
                "titulo": notification_doc["titulo"],
                "descripcion": notification_doc["descripcion"],
                "fecha": notification_doc["fecha"].isoformat(),
                "read": False,
                "application_id": notification_doc.get("application_id"),
                "tipo": notification_doc.get("tipo"),
            },
            room=f"user_{user_id}",
        )

        return notification_doc
    except Exception as e:
        logger.error(f"Failed to create notification: {str(e)}")
        raise ValueError("Failed to create notification")


async def get_notifications_by_user(db, user_id: int) -> List[Dict[str, Any]]:
    try:
        cursor = db["notifications"].find({"user_id": user_id}).sort("fecha", -1)
        notifications = await cursor.to_list(length=100)
        for notif in notifications:
            notif["notification_id"] = notif.pop("_id")
        return notifications
    except Exception as e:
        logger.error(f"Failed to get notifications for user {user_id}: {str(e)}")
        raise ValueError("Failed to retrieve notifications")


async def get_unread_count(db, user_id: int) -> int:
    try:
        count = await db["notifications"].count_documents(
            {"user_id": user_id, "read": False}
        )
        return count
    except Exception as e:
        logger.error(f"Failed to get unread count for user {user_id}: {str(e)}")
        return 0


async def mark_notification_read(db, notification_id: str, user_id: int) -> bool:
    try:
        result = await db["notifications"].update_one(
            {"_id": notification_id, "user_id": user_id}, {"$set": {"read": True}}
        )
        return result.modified_count > 0
    except Exception as e:
        logger.error(f"Failed to mark notification {notification_id} as read: {str(e)}")
        raise ValueError("Failed to update notification")


async def mark_all_read(db, user_id: int) -> bool:
    try:
        result = await db["notifications"].update_many(
            {"user_id": user_id, "read": False}, {"$set": {"read": True}}
        )
        return result.modified_count > 0
    except Exception as e:
        logger.error(
            f"Failed to mark all notifications as read for user {user_id}: {str(e)}"
        )
        raise ValueError("Failed to update notifications")
