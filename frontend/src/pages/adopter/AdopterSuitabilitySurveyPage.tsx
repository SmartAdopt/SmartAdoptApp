// src/pages/adopter/AdopterSuitabilitySurveyPage.tsx

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { AdopterLayout } from "../../components/templates/AdopterLayout";
import { SuitabilitySurvey } from "../../components/organisms/SuitabilitySurvey";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  type SuitabilitySurveyData,
  type AdoptionFormGetResponse,
  mapSurveyToBackendRequest,
  mapBackendResponseToSurvey,
} from "../../types/suitability.types";
import { adoptionFormService } from "../../services/adoptionForm.service";

export const AdopterSuitabilitySurveyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const searchParams = new URLSearchParams(location.search);
  const isRedo = searchParams.get("redo") === "true";

  // State for loading, error, and existing form data
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [existingForm, setExistingForm] =
    useState<AdoptionFormGetResponse | null>(null);
  const [initialSurveyData, setInitialSurveyData] = useState<
    SuitabilitySurveyData | undefined
  >(undefined);

  // Fetch existing form data on mount
  useEffect(() => {
    const fetchExistingForm = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const form = await adoptionFormService.getMyForm();
        setExistingForm(form);

        // If a form exists and this is not a redo, populate the form fields
        if (form && !isRedo) {
          const mappedData = mapBackendResponseToSurvey(form);
          setInitialSurveyData(mappedData);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al cargar el formulario";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingForm();
  }, [isRedo]);

  const handleSubmit = async (data: SuitabilitySurveyData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const backendPayload = mapSurveyToBackendRequest(data);

      if (existingForm) {
        // User already has a form — update it
        await adoptionFormService.updateMyForm(backendPayload);
      } else {
        // No existing form — submit a new one
        await adoptionFormService.submitForm(backendPayload);
      }

      // Invalidate the react-query cache so the suitability hub
      // immediately reflects the new form state without a manual refresh
      await queryClient.invalidateQueries({ queryKey: ["adoptionForm"] });

      // Also keep localStorage in sync for offline UI state
      localStorage.setItem("suitabilitySurveyData", JSON.stringify(data));

      // Navigate back to the suitability hub
      navigate("/adopter/suitability");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al enviar el formulario. Intente nuevamente.";
      setSubmitError(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/adopter/suitability");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AdopterLayout>
      <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 0 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Registro de Idoneidad
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Por favor completa este formulario con sinceridad para encontrar a
            tu compañero ideal.
          </Typography>
        </Box>

        {/* Error alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError}
          </Alert>
        )}

        {/* Loading state */}
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 10,
            }}
          >
            <CircularProgress />
            <Typography variant="body1" color="text.secondary" sx={{ ml: 2 }}>
              Cargando formulario...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mb: 5, position: "relative" }}>
            {isSubmitting && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: "rgba(255,255,255,0.7)",
                  zIndex: 10,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 3,
                }}
              >
                <CircularProgress />
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ ml: 2 }}
                >
                  Enviando formulario...
                </Typography>
              </Box>
            )}
            <SuitabilitySurvey
              initialData={initialSurveyData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </Box>
        )}
      </Container>
    </AdopterLayout>
  );
};
