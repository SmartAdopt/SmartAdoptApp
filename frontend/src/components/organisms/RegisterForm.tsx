// src/components/organisms/RegisterForm.tsx
import { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Alert, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthToggle } from '../molecules/AuthToggle';
import { SocialLoginGroup } from '../molecules/SocialLoginGroup';
import { authService } from '../../services/auth.service';
import type { Role } from '../../types/auth.types';

export const RegisterForm = () => {
  const navigate = useNavigate();

  // States for form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // States for control
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Business Rule: Validate passwords from the Frontend
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor, verifica.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phoneNumber,
        password: password,
        requested_role: 'adopter' as Role // For default registration, we set the role to 'adopter'. This can be changed later by
      });

      // If everything goes well, we redirect to login so they can log in
      alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
      navigate('/login');
      
    } catch (err) {
      setError('Hubo un error al registrar el usuario. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <AuthToggle />
      
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Crear Cuenta
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Únete a SmartAdopt para comenzar tu camino
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Nombre *" fullWidth required value={firstName} onChange={(e) => setFirstName(e.target.value)} InputProps={{ sx: { bgcolor: 'grey.50' } }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Apellido *" fullWidth required value={lastName} onChange={(e) => setLastName(e.target.value)} InputProps={{ sx: { bgcolor: 'grey.50' } }} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Correo Electrónico *" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} InputProps={{ sx: { bgcolor: 'grey.50' } }} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Número de Teléfono *" fullWidth required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} InputProps={{ sx: { bgcolor: 'grey.50' } }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Contraseña *" type="password" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} InputProps={{ sx: { bgcolor: 'grey.50' } }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Confirmar *" type="password" fullWidth required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} InputProps={{ sx: { bgcolor: 'grey.50' } }} />
          </Grid>
        </Grid>

        <Button type="submit" variant="contained" color="warning" size="large" fullWidth disabled={isLoading} sx={{ py: 1.5, mt: 3 }}>
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Crear Cuenta'}
        </Button>
      </Box>

      <SocialLoginGroup />

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button component={RouterLink} to="/" color="inherit" sx={{ color: 'text.secondary' }}>
          ← Volver a inicio
        </Button>
      </Box>
    </Box>
  );
};