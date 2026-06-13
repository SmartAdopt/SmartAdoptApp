// src/components/atoms/QuickActionButton.tsx

import { Paper, Typography, Box } from "@mui/material";

interface QuickActionButtonProps {
  titulo: string;
  icono: React.ReactNode;
  onClick?: () => void;
}

export const QuickActionButton = ({
  titulo,
  icono,
  onClick,
}: QuickActionButtonProps) => {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        width: 140,
        height: 90,

        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",

        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",

        cursor: "pointer",

        transition: "all .2s ease",

        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3,
          borderColor: "primary.main",
        },
      }}
    >
      <Box
        sx={{
          color: "primary.main",
          mb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icono}
      </Box>

      <Typography variant="body2" fontWeight={600}>
        {titulo}
      </Typography>
    </Paper>
  );
};
