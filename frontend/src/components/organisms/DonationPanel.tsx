// src/components/organisms/DonationPanel.tsx

import { Paper, Typography, Button } from "@mui/material";

export const DonationPanel = () => {
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
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Apoya una Fundación
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Tu ayuda permite rescatar y cuidar más mascotas.
      </Typography>

      <Button fullWidth variant="contained">
        Donar Ahora
      </Button>
    </Paper>
  );
};
