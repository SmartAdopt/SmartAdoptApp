// src/components/organisms/ImpactSection.tsx
import { Box, Container, Typography, Grid } from '@mui/material';

export const ImpactSection = () => {
  return (
    <Container maxWidth="lg" sx={{ mb: 8 }}>
      <Box sx={{ bgcolor: '#F0FDF4', borderRadius: 4, py: 6, px: 2, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 5 }}>
          Nuestro Impacto
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
          {/* Metric 1 */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, borderRadius: '50%', mb: 2 }}>
                <img src="/adopt.svg" width={24} />
              </Box>
              <Typography variant="h3" color="primary.main" fontWeight={700}>
                100
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Adopciones Exitosas
              </Typography>
            </Box>
          </Grid>

          {/* Metric 2 */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ bgcolor: 'success.main', color: 'white', p: 1.5, borderRadius: '50%', mb: 2 }}>
                <img src="/logo.svg" width={24} />
              </Box>
              <Typography variant="h3" color="success.main" fontWeight={700}>
                95%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tasa de Éxito en Adopciones
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};