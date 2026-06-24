// src/components/organisms/SharePanel.tsx

import { Paper, Typography, Button } from "@mui/material";

import { Share as ShareIcon } from "@mui/icons-material";

export const SharePanel = () => {
  const handleShare = async () => {
    const shareData = {
      title: "SmartAdopt",
      text: "¡Descubre SmartAdopt! Una plataforma increíble para encontrar y adoptar a tu próximo mejor amigo.",
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text} ${shareData.url}`,
        );
        alert("¡Enlace copiado al portapapeles! Gracias por compartir.");
      }
    } catch (err) {
      console.error("Error al compartir:", err);
    }
  };

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
        Comparte SmartAdopt
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Ayuda a más mascotas compartiendo la plataforma.
      </Typography>

      <Button
        startIcon={<ShareIcon />}
        variant="outlined"
        fullWidth
        onClick={handleShare}
      >
        Compartir
      </Button>
    </Paper>
  );
};
