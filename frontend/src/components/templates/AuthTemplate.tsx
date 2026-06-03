// src/components/templates/AuthTemplate.tsx
import { Box, Grid, Container } from '@mui/material';
import type { ReactNode } from 'react';
import { LeftAuthSidebar } from '../organisms/LeftAuthSidebar';

interface AuthTemplateProps {
  children: ReactNode; // Here we will inject either LoginForm or RegisterForm
}

export const AuthTemplate = ({ children }: AuthTemplateProps) => {
  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      {/* Left Sidebar - Hidden on small screens (mobile) */}
      <Grid 
        item 
        xs={12} 
        md={5} 
        lg={4} 
        sx={{ 
          bgcolor: 'grey.50', 
          borderRight: '1px solid', 
          borderColor: 'divider',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          p: 4
        }}
      >
        <LeftAuthSidebar />
      </Grid>

      {/* Right Form Area */}
      <Grid 
        item 
        xs={12} 
        md={7} 
        lg={8} 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'background.paper',
          p: { xs: 2, sm: 4 }
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ width: '100%' }}>
            {children}
          </Box>
        </Container>
      </Grid>
    </Grid>
  );
};