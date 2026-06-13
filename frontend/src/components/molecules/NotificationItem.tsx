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
        borderBottom: "1px solid",
        borderColor: "grey.200",
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
