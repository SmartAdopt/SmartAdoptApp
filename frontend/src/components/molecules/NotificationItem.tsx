// src/components/molecules/NotificationItem.tsx

import { Box, Typography } from "@mui/material";

interface NotificationItemProps {
  titulo: string;
  descripcion: string;
  fecha: string;
}

export const NotificationItem = ({
  titulo,
  descripcion,
  fecha,
}: NotificationItemProps) => {
  return (
    <Box
      sx={{
        py: 2,
        px: 2,
        mb: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.200",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          bgcolor: "grey.50",
          transform: "translateY(-2px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        },
      }}
    >
      <Typography fontWeight={600} gutterBottom>
        {titulo}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {descripcion}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        {fecha}
      </Typography>
    </Box>
  );
};
