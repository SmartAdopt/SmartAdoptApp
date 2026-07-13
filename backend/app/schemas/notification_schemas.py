from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class NotificationResponse(BaseModel):
    notification_id: str
    titulo: str
    descripcion: str
    fecha: datetime
    read: bool
    application_id: Optional[str] = None
    tipo: Optional[str] = None


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    count: int
    unread_count: int


class UnreadCountResponse(BaseModel):
    count: int
