import {
  Paper,
  Typography,
} from "@mui/material";

import { useEffect, useState } from "react";

import { dashboardService } from "../../services/dashboard.service";

import type { Event } from "../../types/dashboard.types";

import { EventCard } from "../molecules/EventCard";

export const EventsPanel = () => {
  const [events, setEvents] =
    useState<Event[]>([]);

  useEffect(() => {
    const load = async () => {
      const data =
        await dashboardService.getEvents();

      setEvents(data);
    };

    load();
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mt: 3,
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
        Próximos Eventos
      </Typography>

      {events.map((event) => (
        <EventCard
          key={event.id}
          titulo={event.titulo}
          lugar={event.lugar}
          fecha={event.fecha}
          hora={event.hora}
        />
      ))}
    </Paper>
  );
};