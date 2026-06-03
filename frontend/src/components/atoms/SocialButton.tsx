import { Button } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import type { ReactNode } from 'react';

interface SocialButtonProps extends ButtonProps {
  icon: ReactNode;
  label: string;
}

export const SocialButton = ({ icon, label, ...props }: SocialButtonProps) => {
  return (
    <Button
      variant="outlined"
      fullWidth
      startIcon={icon}
      sx={{
        color: 'text.primary',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        py: 1.5,
        fontWeight: 500,
        '&:hover': {
          bgcolor: 'grey.50',
          borderColor: 'divider',
        },
      }}
      {...props}
    >
      {label}
    </Button>
  );
};