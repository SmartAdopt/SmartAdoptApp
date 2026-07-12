// src/components/organisms/NotificationsPanel.tsx

import { Paper, Typography, Box, Badge, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { notificationService } from "../../services/notification.service";
import type { BackendNotification } from "../../types/dashboard.types";
import { NotificationItem } from "../molecules/NotificationItem";
import { useNavigate } from "react-router-dom";

export const NotificationsPanel = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await notificationService.getNotifications();
        if (!ignore) setNotifications(data);
        const count = await notificationService.getUnreadCount();
        if (!ignore) setUnreadCount(count);
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const handleNotificationClick = async (notification: BackendNotification) => {
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification.notification_id);
        refreshNotifications();
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }
    // Navigate to requests page for any adoption-related notification
    navigate("/adopter/requests");
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      refreshNotifications();
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          <Badge
            badgeContent={unreadCount}
            color="primary"
            sx={{ "& .MuiBadge-badge": { right: -15, top: 5 } }}
          >
            Notificaciones
          </Badge>
        </Typography>
        {unreadCount > 0 && (
          <Button
            size="small"
            onClick={handleMarkAllAsRead}
            variant="text"
            sx={{ textTransform: "none" }}
          >
            Marcar todas como leídas
          </Button>
        )}
      </Box>

      {notifications.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ py: 2, textAlign: "center" }}
        >
          No tienes notificaciones por el momento.
        </Typography>
      ) : (
        notifications.map((notification) => (
          <NotificationItem
            key={notification.notification_id}
            titulo={notification.titulo}
            descripcion={notification.descripcion}
            fecha={notification.fecha}
            read={notification.read}
            tipo={notification.tipo}
            onClick={() => handleNotificationClick(notification)}
          />
        ))
      )}
    </Paper>
  );
};
