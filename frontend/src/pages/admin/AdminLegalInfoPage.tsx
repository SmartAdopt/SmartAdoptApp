// src/pages/admin/AdminLegalInfoPage.tsx

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "../../components/templates/AdminLayout";
import { foundationService } from "../../services/foundation.service";

const legalInfoSchema = z.object({
  legalName: z.string().min(2, "El nombre legal es requerido"),
  address: z.string().min(5, "La dirección es requerida"),
  phone: z.string().min(5, "El teléfono es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  legalRepresentative: z.string().min(2, "El representante legal es requerido"),
  businessHours: z.string().min(2, "Los horarios son requeridos"),
});

type LegalInfoFormDataSchema = z.infer<typeof legalInfoSchema>;

export const AdminLegalInfoPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LegalInfoFormDataSchema>({
    resolver: zodResolver(legalInfoSchema),
    defaultValues: {
      legalName: "",
      address: "",
      phone: "",
      email: "",
      legalRepresentative: "",
      businessHours: "",
    },
  });

  const {
    data: foundationData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["foundationInfo"],
    queryFn: foundationService.getFoundation,
  });

  useEffect(() => {
    if (foundationData) {
      reset(foundationData);
    }
  }, [foundationData, reset]);

  const mutation = useMutation({
    mutationFn: (data: LegalInfoFormDataSchema) =>
      foundationService.updateFoundation(data),
    onSuccess: () => {
      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["foundationInfo"] });
      setTimeout(() => setIsSuccess(false), 3000);
    },
  });

  const onSubmit = (data: LegalInfoFormDataSchema) => {
    mutation.mutate(data);
  };

  return (
    <AdminLayout>
      {/* HEADER */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/dashboard")}
          sx={{ mb: 2, color: "text.secondary", textTransform: "none" }}
        >
          Volver al Dashboard
        </Button>
        <Typography variant="h4" fontWeight={700}>
          Datos Legales
        </Typography>
        <Typography color="text.secondary">
          Visualiza y edita la información legal de la organización.
        </Typography>
      </Box>

      {/* FORM CARD */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "grey.200",
          maxWidth: 900,
          mx: "auto",
        }}
      >
        {isSuccess && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "success.50",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "success.200",
            }}
          >
            <Typography color="success.800" fontWeight={600} textAlign="center">
              ¡Datos legales actualizados correctamente!
            </Typography>
          </Box>
        )}

        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            Hubo un error al guardar los cambios. Inténtalo de nuevo.
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            Error al cargar la información legal de la fundación.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="legalName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nombre Legal *"
                      fullWidth
                      error={!!errors.legalName}
                      helperText={errors.legalName?.message}
                      InputProps={{ sx: { bgcolor: "grey.50" } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="legalRepresentative"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Representante Legal *"
                      fullWidth
                      error={!!errors.legalRepresentative}
                      helperText={errors.legalRepresentative?.message}
                      InputProps={{ sx: { bgcolor: "grey.50" } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Dirección *"
                      fullWidth
                      error={!!errors.address}
                      helperText={errors.address?.message}
                      InputProps={{ sx: { bgcolor: "grey.50" } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Teléfono *"
                      fullWidth
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      InputProps={{ sx: { bgcolor: "grey.50" } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email Oficial *"
                      type="email"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      InputProps={{ sx: { bgcolor: "grey.50" } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="businessHours"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Horarios de Atención *"
                      fullWidth
                      error={!!errors.businessHours}
                      helperText={errors.businessHours?.message}
                      InputProps={{ sx: { bgcolor: "grey.50" } }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
                >
                  <Button
                    variant="text"
                    color="inherit"
                    onClick={() => navigate("/admin/dashboard")}
                    disabled={mutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={mutation.isPending}
                    sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 700 }}
                  >
                    {mutation.isPending ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </AdminLayout>
  );
};
