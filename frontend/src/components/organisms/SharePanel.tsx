import {
  Paper,
  Typography,
  Button,
} from "@mui/material";

import { Share as ShareIcon } from "@mui/icons-material";

export const SharePanel = () => {
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
        Comparte SmartAdopt
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Ayuda a más mascotas compartiendo la plataforma.
      </Typography>

      <Button
        startIcon={<ShareIcon />}
        variant="outlined"
        fullWidth
      >
        Compartir
      </Button>
    </Paper>
  );
};