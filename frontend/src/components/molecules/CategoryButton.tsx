// src/components/molecules/CategoryButton.tsx
import { Button, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface CategoryButtonProps {
  title: string;
  icon: ReactNode;
  color: 'primary' | 'success'; // Usamos los colores definidos en nuestro theme.ts
  onClick?: () => void;
}

export const CategoryButton = ({ title, icon, color, onClick }: CategoryButtonProps) => {
  return (
    <Button
      variant="contained"
      color={color}
      onClick={onClick}
      sx={{
        width: { xs: 100, sm: 120 }, // Responsive: más pequeño en móviles
        height: { xs: 100, sm: 120 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        borderRadius: 3, // Bordes redondeados del diseño
        boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
        '&:hover': {
          transform: 'translateY(-4px)',
          transition: 'transform 0.2s',
          boxShadow: '0px 12px 28px rgba(0,0,0,0.15)',
        }
      }}
    >
      {icon}
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
    </Button>
  );
};