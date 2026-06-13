// src/components/molecules/EventCard.tsx

import { Paper, Typography, Box } from "@mui/material";

interface EventCardProps {
  titulo: string;
  lugar: string;
  fecha: string;
  hora: string;
}

export const EventCard = ({ titulo, lugar, fecha, hora }: EventCardProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.200",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
        }}
      >
        <Box
          sx={{
            minWidth: 70,
            bgcolor: "#E8F5E9",
            borderRadius: 2,
            p: 1,
            textAlign: "center",
          }}
        >
          <Typography fontWeight={700}>{fecha}</Typography>
        </Box>

        <Box>
          <Typography fontWeight={600}>{titulo}</Typography>

          <Typography variant="body2" color="text.secondary">
            {lugar}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {hora}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
