// src/components/atoms/Logo.tsx
import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

interface LogoProps {
  sx?: SxProps<Theme>;
}

export const Logo = ({ sx }: LogoProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }}>
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          borderRadius: 2, 
          p: 0.5, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Placeholder Icon */}
        <img src="/logo.svg" alt="logo" style={{ width: 20, height: 20 }} />
      </Box>
      <Box>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1.2 }}>
          SmartAdopt
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          Plataforma de Rescate Animal
        </Typography>
      </Box>
    </Box>
  );
};