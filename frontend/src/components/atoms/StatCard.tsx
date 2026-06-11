import {
  Paper,
  Typography,
  Box,
} from "@mui/material";

interface StatCardProps {
  titulo: string;
  valor: string;
  icono: React.ReactNode;
}

export const StatCard = ({
  titulo,
  valor,
  icono,
}: StatCardProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        {icono}
      </Box>

      <Typography
        variant="h4"
        fontWeight={700}
      >
        {valor}
      </Typography>

      <Typography
        color="text.secondary"
      >
        {titulo}
      </Typography>
    </Paper>
  );
};