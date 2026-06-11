import { Paper, Typography, Box } from "@mui/material";
import { TrendingUp as TrendingUpIcon } from "@mui/icons-material";
import { type ReactNode } from "react";

interface AdminSummaryCardProps {
  value: string | number;
  label: string;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
}

export const AdminSummaryCard = ({
  value,
  label,
  icon,
  iconBgColor,
  iconColor,
}: AdminSummaryCardProps) => {
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
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: iconBgColor,
            color: iconColor,
            display: "flex",
          }}
        >
          {icon}
        </Box>
        <TrendingUpIcon sx={{ color: "success.main", fontSize: 20 }} />
      </Box>

      <Box>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};