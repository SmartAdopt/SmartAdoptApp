// src/components/organisms/DonationPanel.tsx

import { useState, lazy, Suspense } from "react";
import { Paper, Typography, Button } from "@mui/material";

const DonationModal = lazy(() =>
  import("./DonationModal").then((module) => ({
    default: module.DonationModal,
  }))
);

export const DonationPanel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const DEFAULT_DONATION_AMOUNT = 10; // Fixed amount for simplicity

  return (
    <>
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

        <Button
          fullWidth
          variant="contained"
          onClick={() => setIsModalOpen(true)}
        >
          Donar Ahora
        </Button>
      </Paper>
      <Suspense fallback={null}>
        {isModalOpen && (
          <DonationModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            amount={DEFAULT_DONATION_AMOUNT}
          />
        )}
      </Suspense>
    </>
  );
};
