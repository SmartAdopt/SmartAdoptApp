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
      // Asegurar que no haya duplicados (por application_id/tipo o notification_id)
      const uniqueData = data.filter((v, i, a) => {
        if (v.application_id && v.tipo) {
          return (
            a.findIndex(
              (t) => t.application_id === v.application_id && t.tipo === v.tipo
            ) === i
          );
        }
        return (
          a.findIndex((t) => t.notification_id === v.notification_id) === i
        );
      });
      setNotifications(uniqueData);
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
        if (!ignore) {
          const uniqueData = data.filter((v, i, a) => {
            if (v.application_id && v.tipo) {
              return (
                a.findIndex(
                  (t) =>
                    t.application_id === v.application_id && t.tipo === v.tipo
                ) === i
              );
            }
            return (
              a.findIndex((t) => t.notification_id === v.notification_id) === i
            );
          });
          // Fix: when real-time adds them, make sure we merge deduplicated from server
          setNotifications(uniqueData);
        }
        const count = await notificationService.getUnreadCount();
        if (!ignore) setUnreadCount(count);
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    })();

    const handleNewNotification = (event: Event) => {
      if (ignore) return;
      const customEvent = event as CustomEvent;
      const newNotif = customEvent.detail as BackendNotification;

      // Add strictly to the top if not duplicate
      setNotifications((prev) => {
        const isDuplicate = prev.some((p) => {
          if (newNotif.application_id && newNotif.tipo) {
            return (
              p.application_id === newNotif.application_id &&
              p.tipo === newNotif.tipo
            );
          }
          return p.notification_id === newNotif.notification_id;
        });

        if (isDuplicate) return prev;
        return [newNotif, ...prev];
      });

      setUnreadCount((prev) => prev + 1);
    };

    window.addEventListener("new_notification", handleNewNotification);

    return () => {
      ignore = true;
      window.removeEventListener("new_notification", handleNewNotification);
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
        <Box sx={{ maxHeight: 400, overflowY: "auto", pr: 1 }}>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.notification_id}
              titulo={notification.titulo}
              descripcion={notification.descripcion}
              fecha={notification.fecha}
              read={notification.read}
              tipo={notification.tipo}
              onClick={() => handleNotificationClick(notification)}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
};
