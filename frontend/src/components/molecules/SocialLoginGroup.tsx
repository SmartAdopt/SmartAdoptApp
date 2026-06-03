// src/components/molecules/SocialLoginGroup.tsx
import { Box, Divider, Typography } from '@mui/material';
import { SocialButton } from '../atoms/SocialButton';

export const SocialLoginGroup = () => {
  return (
    <Box sx={{ mt: 4 }}>
      <Divider sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          O continuar con
        </Typography>
      </Divider>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <SocialButton 
          icon={<img src="/google.svg" width={20} alt="Google" />} 
          label="Continuar con Google" 
        />
        <SocialButton 
          icon={<img src="/apple.svg" width={20} alt="Apple" />} 
          label="Continuar con Apple" 
        />
        <SocialButton 
          icon={<img src="/facebook.svg" width={20} alt="Facebook" />} 
          label="Continuar con Facebook" 
        />
      </Box>
    </Box>
  );
};