import {
  Paper,
  Typography,
} from "@mui/material";

import { useEffect, useState } from "react";

import { dashboardService } from "../../services/dashboard.service";

import type { Notification } from "../../types/dashboard.types";

import { NotificationItem } from "../molecules/NotificationItem";

export const NotificationsPanel = () => {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  useEffect(() => {
    const load = async () => {
      const data =
        await dashboardService.getNotifications();

      setNotifications(data);
    };

    load();
  }, []);

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
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: 2 }}
      >
        Notificaciones
      </Typography>

      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          titulo={notification.titulo}
          descripcion={notification.descripcion}
          fecha={notification.fecha}
        />
      ))}
    </Paper>
  );
};