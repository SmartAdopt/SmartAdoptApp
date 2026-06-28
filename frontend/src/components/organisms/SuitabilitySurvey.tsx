// src/components/organisms/SuitabilitySurvey.tsx

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  LinearProgress,
  Divider,
  FormHelperText,
  FormControl,
} from "@mui/material";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type SuitabilitySurveyData,
  initialSurveyData,
  suitabilitySchema,
} from "../../types/suitability.types";

interface SuitabilitySurveyProps {
  onSubmit: (data: SuitabilitySurveyData) => void;
  onCancel?: () => void;
  initialData?: SuitabilitySurveyData;
}

const stepsFields: (keyof SuitabilitySurveyData)[][] = [
  // Phase 1
  [
    "cityNeighborhood",
    "address",
    "employmentStatus",
    "employmentStatusOther",
    "housingType",
    "housingTypeOther",
    "hasNaturalSpace",
  ],
  // Phase 2
  [
    "hasPets",
    "petsDetails",
    "homeEnergyLevel",
    "hasChildren",
    "childrenAges",
    "longTermCommitment",
  ],
  // Phase 3
  ["preferredSpecies", "preferredGender", "preferredEnergy"],
  // Phase 4
  [
    "dailyTimeCommitment",
    "sleepingLocation",
    "sleepingLocationOther",
    "behaviorProblemAction",
    "behaviorProblemActionOther",
    "emergencyPlan",
    "emergencyPlanOther",
  ],
  // Phase 5
  ["adoptionMotivation"],
];

export const SuitabilitySurvey: React.FC<SuitabilitySurveyProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const totalSteps = stepsFields.length;

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<SuitabilitySurveyData>({
    resolver: zodResolver(suitabilitySchema),
    mode: "onChange",
    defaultValues: initialData || initialSurveyData,
  });

  // Watch fields for conditional rendering
  const employmentStatus = useWatch({ control, name: "employmentStatus" });
  const housingType = useWatch({ control, name: "housingType" });
  const hasPets = useWatch({ control, name: "hasPets" });
  const hasChildren = useWatch({ control, name: "hasChildren" });
  const sleepingLocation = useWatch({ control, name: "sleepingLocation" });
  const behaviorProblemAction = useWatch({
    control,
    name: "behaviorProblemAction",
  });
  const emergencyPlan = useWatch({ control, name: "emergencyPlan" });

  const handleNext = async () => {
    const fieldsToValidate = stepsFields[activeStep];
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid && activeStep < totalSteps - 1) {
      setActiveStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onFormSubmit = (data: SuitabilitySurveyData) => {
    // Only call onSubmit if we are on the last step (to prevent accidental early submits)
    if (activeStep === totalSteps - 1) {
      onSubmit(data);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={800} gutterBottom>
          Formulario de Adopción - SmartAdopt
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Box sx={{ width: "100%", mr: 2 }}>
            <LinearProgress
              variant="determinate"
              value={((activeStep + 1) / totalSteps) * 100}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">
              {activeStep + 1}/{totalSteps}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit(onFormSubmit)}>
        <Grid container spacing={4}>
          {/* PHASE 1 */}
          {activeStep === 0 && (
            <Grid item xs={12}>
              <Typography
                variant="h6"
                fontWeight={700}
                color="primary"
                gutterBottom
              >
                I. Información del Candidato
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ mt: 2 }}
              >
                Ciudad/Barrio
              </Typography>
              <Controller
                name="cityNeighborhood"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    placeholder="Ej. Quito, La Floresta"
                    error={!!errors.cityNeighborhood}
                    helperText={errors.cityNeighborhood?.message}
                  />
                )}
              />

              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ mt: 3 }}
              >
                Domicilio
              </Typography>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    placeholder="Dirección exacta"
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                )}
              />

              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ mt: 3 }}
              >
                Situación laboral
              </Typography>
              <FormControl error={!!errors.employmentStatus} fullWidth>
                <Controller
                  name="employmentStatus"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row={false}>
                      <FormControlLabel
                        value="Empleado"
                        control={<Radio />}
                        label="Empleado"
                      />
                      <FormControlLabel
                        value="Independiente"
                        control={<Radio />}
                        label="Independiente"
                      />
                      <FormControlLabel
                        value="Otro"
                        control={<Radio />}
                        label="Otro"
                      />
                    </RadioGroup>
                  )}
                />
                {errors.employmentStatus && (
                  <FormHelperText>
                    {errors.employmentStatus.message}
                  </FormHelperText>
                )}
              </FormControl>

              {employmentStatus === "Otro" && (
                <Controller
                  name="employmentStatusOther"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      placeholder="Especifique su situación laboral"
                      sx={{ mt: 1 }}
                      error={!!errors.employmentStatusOther}
                      helperText={errors.employmentStatusOther?.message}
                    />
                  )}
                />
              )}

              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ mt: 3 }}
              >
                Tipo de vivienda
              </Typography>
              <FormControl error={!!errors.housingType} fullWidth>
                <Controller
                  name="housingType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <FormControlLabel
                        value="Departamento"
                        control={<Radio />}
                        label="Departamento"
                      />
                      <FormControlLabel
                        value="Casa en renta(con permiso de tener mascota)"
                        control={<Radio />}
                        label="Casa en renta(con permiso de tener mascota)"
                      />
                      <FormControlLabel
                        value="Casa propia"
                        control={<Radio />}
                        label="Casa propia"
                      />
                      <FormControlLabel
                        value="Otro"
                        control={<Radio />}
                        label="Otro"
                      />
                    </RadioGroup>
                  )}
                />
                {errors.housingType && (
                  <FormHelperText>{errors.housingType.message}</FormHelperText>
                )}
              </FormControl>

              {housingType === "Otro" && (
                <Controller
                  name="housingTypeOther"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      placeholder="Especifique tipo de vivienda"
                      sx={{ mt: 1 }}
                      error={!!errors.housingTypeOther}
                      helperText={errors.housingTypeOther?.message}
                    />
                  )}
                />
              )}

              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ mt: 3 }}
              >
                ¿Cuenta con espacio natural cerca (puede ser patio propio)?
              </Typography>
              <FormControl error={!!errors.hasNaturalSpace} fullWidth>
                <Controller
                  name="hasNaturalSpace"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel
                        value="Sí"
                        control={<Radio />}
                        label="Sí"
                      />
                      <FormControlLabel
                        value="No"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  )}
                />
                {errors.hasNaturalSpace && (
                  <FormHelperText>
                    {errors.hasNaturalSpace.message}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
          )}

          {/* PHASE 2 */}
          {activeStep === 1 && (
            <Grid item xs={12}>
              <Typography
                variant="h6"
                fontWeight={700}
                color="primary"
                gutterBottom
              >
                II. Convivencia y Experiencia (Filtros de Riesgo)
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                ¿Tiene mascotas actualmente?
              </Typography>
              <FormControl error={!!errors.hasPets} fullWidth>
                <Controller
                  name="hasPets"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <FormControlLabel
                        value="No"
                        control={<Radio />}
                        label="No"
                      />
                      <FormControlLabel
                        value="Sí"
                        control={<Radio />}
                        label="Sí"
                      />
                    </RadioGroup>
                  )}
                />
                {errors.hasPets && (
                  <FormHelperText>{errors.hasPets.message}</FormHelperText>
                )}
              </FormControl>

              {hasPets === "Sí" && (
                <Controller
                  name="petsDetails"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={2}
                      variant="outlined"
                      placeholder="Especifique temperamento/socialización: Especie/Raza, edad y cómo reacciona ante otros animales."
                      sx={{ mt: 1 }}
                      error={!!errors.petsDetails}
                      helperText={errors.petsDetails?.message}
                    />
                  )}
                />
              )}

              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ mt: 3 }}
              >
                Nivel de energía del hogar
              </Typography>
              <FormControl error={!!errors.homeEnergyLevel} fullWidth>
                <Controller
                  name="homeEnergyLevel"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <FormControlLabel
                        value="Muy activo (deportes, paseos largos)"
                        control={<Radio />}
                        label="Muy activo (deportes, paseos largos)"
                      />
                      <FormControlLabel
                        value="Moderado (caminatas diarias)"
                        control={<Radio />}
                        label="Moderado (caminatas diarias)"
                      />
                      <FormControlLabel
                        value="Tranquilo (casa)"
                        control={<Radio />}
                        label="Tranquilo (casa)"
                      />
                    </RadioGroup>
                  )}
                />
                {errors.homeEnergyLevel && (
                  <FormHelperText>
                    {errors.homeEnergyLevel.message}
                  </FormHelperText>
                )}
              </FormControl>

              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ mt: 3 }}
              >
                Integrantes: ¿Hay niños en casa?
              </Typography>
              <FormControl error={!!errors.hasChildren} fullWidth>
                <Controller
                  name="hasChildren"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <FormControlLabel
                        value="No"
                        control={<Radio />}
                        label="No"
                      />
                      <FormControlLabel
                        value="Sí"
                        control={<Radio />}
                        label="Sí"
                      />
                    </RadioGroup>
                  )}
                />
                {errors.hasChildren && (
                  <FormHelperText>{errors.hasChildren.message}</FormHelperText>
                )}
              </FormControl>

              {hasChildren === "Sí" && (
                <Controller
                  name="childrenAges"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      placeholder="Edades separadas por coma"
                      sx={{ mt: 1 }}
                      error={!!errors.childrenAges}
                      helperText={errors.childrenAges?.message}
                    />
                  )}
                />
              )}

              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ mt: 3 }}
              >
                Compromiso a largo plazo: ¿Está consciente de que la mascota
                puede vivir +15 años y requiere recursos económicos constantes?
              </Typography>
              <FormControl error={!!errors.longTermCommitment} fullWidth>
                <Controller
                  name="longTermCommitment"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel
                        value="Sí"
                        control={<Radio />}
                        label="Sí"
                      />
                      <FormControlLabel
                        value="No"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  )}
                />
                {errors.longTermCommitment && (
                  <FormHelperText>
                    {errors.longTermCommitment.message}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
          )}

          {/* PHASE 3 */}
          {activeStep === 2 && (
            <Grid item xs={12}>
              <Typography
                variant="h6"
                fontWeight={700}
                color="primary"
                gutterBottom
              >
                III. Preferencias de la Mascota (Match con Pet class)
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Especie
              </Typography>
              <FormControl error={!!errors.preferredSpecies} fullWidth>
                <Controller
                  name="preferredSpecies"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <FormControlLabel
                        value="Perro"
                        control={<Radio />}
                        label="Perro"
                      />
                      <FormControlLabel
                        value="Gato"
                        control={<Radio />}
                        label="Gato"
                      />
                      <FormControlLabel
                        value="Sin preferencia"
                        control={<Radio />}
                        label="Sin preferencia"
                      />
                    </RadioGroup>
                  )}
                />
                {errors.preferredSpecies && (
                  <FormHelperText>
                    {errors.preferredSpecies.message}
                  </FormHelperText>
                )}
              </FormControl>

              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ mt: 3 }}
              >
                Género
              </Typography>
              <FormControl error={!!errors.preferredGender} fullWidth>
                <Controller
                  name="preferredGender"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <FormControlLabel
                        value="Macho"
                        control={<Radio />}
                        label="Macho"
                      />
                      <FormControlLabel
                        value="Hembra"
                        control={<Radio />}
                        label="Hembra"
                      />
                      <FormControlLabel
                        value="Sin preferencia"
                        control={<Radio />}
                        label="Sin preferencia"
                      />
                    </RadioGroup>
                  )}
                />
                {errors.preferredGender && (
                  <FormHelperText>
                    {errors.preferredGender.message}
                  </FormHelperText>
                )}
              </FormControl>

              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ mt: 3 }}
              >
                Personalidad/Energía
              </Typography>
              <FormControl error={!!errors.preferredEnergy} fullWidth>
                <Controller
                  name="preferredEnergy"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <FormControlLabel
                        value="Baja (Tranquilo)"
                        control={<Radio />}
                        label="Baja (Tranquilo)"
                      />
                      <FormControlLabel
                        value="Media (Juguetón)"
                        control={<Radio />}
                        label="Media (Juguetón)"
                      />
                      <FormControlLabel
                        value="Alta (Muy activo)"
                        control={<Radio />}
                        label="Alta (Muy activo)"
                      />
                    </RadioGroup>
                  )}
                />
                {errors.preferredEnergy && (
                  <FormHelperText>
                    {errors.preferredEnergy.message}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
          )}

          {/* PHASE 4 */}
          {activeStep === 3 && (
            <Grid item xs={12}>
              <Typography
                variant="h6"
                fontWeight={700}
                color="primary"
                gutterBottom
              >
                IV. Logística y Educación
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Tiempo que le dedicara a la mascota al día
              </Typography>
              <FormControl error={!!errors.dailyTimeCommitment} fullWidth>
                <Controller
                  name="dailyTimeCommitment"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <FormControlLabel
                        value="< 2 horas"
                        control={<Radio />}
                        label="< 2 horas"
                      />
                      <FormControlLabel
                        value="2 - 6 horas"
                        control={<Radio />}
                        label="2 - 6 horas"
                      />
                      <FormControlLabel
                        value="> 6 horas"
                        control={<Radio />}
                        label="> 6 horas"
                      />
                    </RadioGroup>
                  )}
                />
                {errors.dailyTimeCommitment && (
                  <FormHelperText>
                    {errors.dailyTimeCommitment.message}
                  </FormHelperText>
                )}
              </FormControl>

              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ mt: 3 }}
              >
                ¿Dónde dormirá la mascota?
              </Typography>
              <FormControl error={!!errors.sleepingLocation} fullWidth>
                <Controller
                  name="sleepingLocation"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <FormControlLabel
                        value="Dentro de casa/cama"
                        control={<Radio />}
                        label="Dentro de casa/cama"
                      />
                      <FormControlLabel
                        value="Patio"
                        control={<Radio />}
                        label="Patio"
                      />
                      <FormControlLabel
                        value="Otro"
                        control={<Radio />}
                        label="Otro"
                      />
                    </RadioGroup>
                  )}
                />
                {errors.sleepingLocation && (
                  <FormHelperText>
                    {errors.sleepingLocation.message}
                  </FormHelperText>
                )}
              </FormControl>

              {sleepingLocation === "Otro" && (
                <Controller
                  name="sleepingLocationOther"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      placeholder="Especifique lugar"
                      sx={{ mt: 1 }}
                      error={!!errors.sleepingLocationOther}
                      helperText={errors.sleepingLocationOther?.message}
                    />
                  )}
                />
              )}

              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ mt: 3 }}
              >
                ¿Qué hará ante problemas de conducta (destrozos, ladridos)?
              </Typography>
              <FormControl error={!!errors.behaviorProblemAction} fullWidth>
                <Controller
                  name="behaviorProblemAction"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <FormControlLabel
                        value="Refuerzo positivo/Educación"
                        control={<Radio />}
                        label="Refuerzo positivo/Educación"
                      />
                      <FormControlLabel
                        value="Contratar adiestrador"
                        control={<Radio />}
                        label="Contratar adiestrador"
                      />
                      <FormControlLabel
                        value="Otro"
                        control={<Radio />}
                        label="Otro"
                      />
                    </RadioGroup>
                  )}
                />
                {errors.behaviorProblemAction && (
                  <FormHelperText>
                    {errors.behaviorProblemAction.message}
                  </FormHelperText>
                )}
              </FormControl>

              {behaviorProblemAction === "Otro" && (
                <Controller
                  name="behaviorProblemActionOther"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      placeholder="Especifique acción"
                      sx={{ mt: 1 }}
                      error={!!errors.behaviorProblemActionOther}
                      helperText={errors.behaviorProblemActionOther?.message}
                    />
                  )}
                />
              )}

              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ mt: 3 }}
              >
                Plan de emergencia: En caso de viaje/mudanza, ¿quién cuidará a
                la mascota?
              </Typography>
              <FormControl error={!!errors.emergencyPlan} fullWidth>
                <Controller
                  name="emergencyPlan"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <FormControlLabel
                        value="Familiar/Amigo"
                        control={<Radio />}
                        label="Familiar/Amigo"
                      />
                      <FormControlLabel
                        value="Guardería"
                        control={<Radio />}
                        label="Guardería"
                      />
                      <FormControlLabel
                        value="Me la llevo conmigo"
                        control={<Radio />}
                        label="Me la llevo conmigo"
                      />
                      <FormControlLabel
                        value="Otro"
                        control={<Radio />}
                        label="Otro"
                      />
                    </RadioGroup>
                  )}
                />
                {errors.emergencyPlan && (
                  <FormHelperText>
                    {errors.emergencyPlan.message}
                  </FormHelperText>
                )}
              </FormControl>

              {emergencyPlan === "Otro" && (
                <Controller
                  name="emergencyPlanOther"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      placeholder="Especifique plan"
                      sx={{ mt: 1 }}
                      error={!!errors.emergencyPlanOther}
                      helperText={errors.emergencyPlanOther?.message}
                    />
                  )}
                />
              )}
            </Grid>
          )}

          {/* PHASE 5 */}
          {activeStep === 4 && (
            <Grid item xs={12}>
              <Typography
                variant="h6"
                fontWeight={700}
                color="primary"
                gutterBottom
              >
                V. Motivación Final
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                ¿Por qué quieres adoptar y qué le ofrecerás a tu nuevo amigo?
              </Typography>
              <Controller
                name="adoptionMotivation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    placeholder="Cuéntanos brevemente tus razones..."
                    error={!!errors.adoptionMotivation}
                    helperText={errors.adoptionMotivation?.message}
                  />
                )}
              />
            </Grid>
          )}
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 5 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            {onCancel && (
              <Button
                variant="text"
                color="inherit"
                onClick={onCancel}
                sx={{ px: 4 }}
              >
                Cancelar
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{ px: 4 }}
            >
              Atrás
            </Button>
          </Box>

          {activeStep < totalSteps - 1 ? (
            <Button variant="contained" onClick={handleNext} sx={{ px: 4 }}>
              Siguiente
            </Button>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 2,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "right", maxWidth: 400 }}
              >
                Al hacer clic en el botón enviar, verifico que toda la
                información anterior es verdadera y precisa.
              </Typography>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ px: 4 }}
              >
                Enviar
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};
