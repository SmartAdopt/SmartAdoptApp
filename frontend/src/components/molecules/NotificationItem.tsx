// src/components/molecules/NotificationItem.tsx

import { Box, Typography } from "@mui/material";

interface NotificationItemProps {
  titulo: string;
  descripcion: string;
  fecha: string;
  read: boolean;
  tipo?: "approved" | "rejected";
  onClick?: () => void;
}

export const NotificationItem = ({
  titulo,
  descripcion,
  fecha,
  read,
  onClick,
}: NotificationItemProps) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        py: 2,
        px: 2,
        mb: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.200",
        borderLeft: !read ? "4px solid" : "1px solid",
        borderLeftColor: !read ? "primary.main" : "grey.200",
        opacity: read ? 0.7 : 1,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          bgcolor: "grey.50",
          transform: "translateY(-2px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          opacity: 1,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Typography fontWeight={read ? 600 : 800} gutterBottom>
          {titulo}
        </Typography>
        {!read && (
          <Box
            sx={{
              width: 8,
              height: 8,
              bgcolor: "primary.main",
              borderRadius: "50%",
              mt: 1,
            }}
          />
        )}
      </Box>

      <Typography variant="body2" color="text.secondary">
        {descripcion}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 1 }}
      >
        {new Date(fecha).toLocaleDateString()}
      </Typography>
    </Box>
  );
};
