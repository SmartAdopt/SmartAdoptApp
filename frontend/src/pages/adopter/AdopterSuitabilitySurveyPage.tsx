// src/pages/adopter/AdopterSuitabilitySurveyPage.tsx

import { Box, Container, Typography } from "@mui/material";
import { AdopterLayout } from "../../components/templates/AdopterLayout";
import { SuitabilitySurvey } from "../../components/organisms/SuitabilitySurvey";
import { useNavigate, useLocation } from "react-router-dom";
import {
  type SuitabilitySurveyData,
  mapSurveyToBackendRequest,
} from "../../types/suitability.types";

export const AdopterSuitabilitySurveyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isRedo = searchParams.get("redo") === "true";

  // Load existing data if they are editing
  const saved = localStorage.getItem("suitabilitySurveyData");
  const surveyData: SuitabilitySurveyData | null =
    saved && !isRedo ? JSON.parse(saved) : null;

  const handleSubmit = (data: SuitabilitySurveyData) => {
    // 1. Map to backend contract
    const userId = 1; // Assuming user_id = 1 for now
    const backendPayload = mapSurveyToBackendRequest(data, userId);
    console.log("Submitting survey data to backend:", backendPayload);

    // 2. Save local state
    localStorage.setItem("suitabilitySurveyData", JSON.stringify(data));

    // 3. Navigate back to the suitability hub
    navigate("/adopter/suitability");
    window.scrollTo({ top: 0, behavior: "smooth" });
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

        <Box sx={{ mb: 5 }}>
          <SuitabilitySurvey
            initialData={surveyData || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </Box>
      </Container>
    </AdopterLayout>
  );
};
