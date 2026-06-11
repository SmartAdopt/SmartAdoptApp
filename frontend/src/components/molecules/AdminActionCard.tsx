import { Paper, Typography, Box, Button } from "@mui/material";
import { type ReactNode } from "react";

interface AdminActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  buttonColor: "primary" | "success" | "warning" | "secondary";
  buttonText?: string;
  onClick: () => void;
}

export const AdminActionCard = ({
  icon,
  title,
  description,
  buttonColor,
  buttonText = "Abrir",
  onClick,
}: AdminActionCardProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        height: "100%",
      }}
    >
      <Box sx={{ color: `${buttonColor}.main`, mb: 2 }}>{icon}</Box>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3, flexGrow: 1 }}
      >
        {description}
      </Typography>
      <Button
        variant="contained"
        color={buttonColor}
        fullWidth
        disableElevation
        onClick={onClick}
        sx={{ borderRadius: 2 }}
      >
        {buttonText}
      </Button>
    </Paper>
  );
};
