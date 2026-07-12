from datetime import datetime
from typing import Optional


class Notification:
    def __init__(
        self,
        notification_id: str,
        user_id: int,
        titulo: str,
        descripcion: str,
        fecha: datetime,
        read: bool = False,
        application_id: Optional[str] = None,
        tipo: Optional[str] = None,
    ):
        self.notification_id = notification_id
        self.user_id = user_id
        self.titulo = titulo
        self.descripcion = descripcion
        self.fecha = fecha
        self.read = read
        self.application_id = application_id
        self.tipo = tipo  # "approved" | "rejected" | None
