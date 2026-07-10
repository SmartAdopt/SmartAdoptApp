import {
  Box,
  Typography,
  Card,
  Grid,
  Chip,
  LinearProgress,
  Button,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Event as EventIcon,
  Update as UpdateIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import type { AdoptionRequest } from "../../types/adoption.types";
import type { AIProfileResponse } from "../../types/pets.types";
import { PUBLIC_ASSETS } from "../../utils/publicAssets";

export type RequestWithPet = AdoptionRequest & { pet: AIProfileResponse };

export const AdopterRequestCard = ({
  request,
  onViewDetails,
}: {
  request: RequestWithPet;
  onViewDetails?: (req: RequestWithPet) => void;
}) => {
  const petImage = request.pet.pet.pet_image_url || PUBLIC_ASSETS.dog;
  const petName = request.pet.pet.name;
  const breed =
    request.pet.pet.animal_breed.length > 1
      ? request.pet.pet.animal_breed[1]
      : request.pet.pet.animal_breed[0];
  const age = request.pet.pet.age;
  const size =
    request.pet.pet.weight_kg && request.pet.pet.weight_kg > 15
      ? "Grande"
      : "Pequeño";

  const isApproved = request.status === "approved";
  const isRejected = request.status === "rejected";
  const isFinalized = isApproved || isRejected;

  const statusColor: "success" | "error" | "primary" = isApproved
    ? "success"
    : isRejected
      ? "error"
      : "primary";
  const statusLabel = isApproved
    ? "Aprobada"
    : isRejected
      ? "Rechazada"
      : "En Revisión";

  if (isFinalized) {
    return (
      <Card
        key={request.id}
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: `${statusColor}.main`,
          bgcolor: `${statusColor}.50`,
          overflow: "hidden",
          opacity: 0.9,
        }}
      >
        <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 3 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              border: "2px solid white",
            }}
          >
            <img
              src={petImage}
              alt={petName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              {petName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {breed} • {age} {age === 1 ? "año" : "años"}
            </Typography>
          </Box>
          <Chip
            label={statusLabel}
            color={statusColor}
            sx={{ fontWeight: 600, mr: 2 }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => onViewDetails?.(request)}
          >
            Ver Detalles
          </Button>
        </Box>
      </Card>
    );
  }

  return (
    <Card
      key={request.id}
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "grey.200",
        overflow: "hidden",
      }}
    >
      <Grid container>
        <Grid item xs={12} sm={4} md={3}>
          <Box
            component="img"
            src={petImage}
            alt={petName}
            sx={{
              width: "100%",
              height: "100%",
              minHeight: { xs: 200, sm: 320 },
              objectFit: "cover",
            }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = PUBLIC_ASSETS.dog;
            }}
          />
        </Grid>
        <Grid item xs={12} sm={8} md={9}>
          <Box sx={{ p: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h5" fontWeight={700}>
                  {petName}
                </Typography>
                <Chip
                  label={statusLabel}
                  size="small"
                  color={statusColor}
                  sx={{ fontWeight: 600, borderRadius: 2 }}
                />
              </Box>
              {isApproved ? (
                <CheckCircleOutlineIcon color="success" />
              ) : (
                <AccessTimeIcon color="primary" />
              )}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {breed} • {age} {age === 1 ? "año" : "años"} • {size}
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                Progreso de Solicitud
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {request.progressPercentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={request.progressPercentage}
              color={statusColor}
              sx={{ height: 8, borderRadius: 4, mb: 3 }}
            />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "flex-start",
                  }}
                >
                  <EventIcon color="action" fontSize="small" />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Enviado
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {new Date(request.dateSubmitted).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "flex-start",
                  }}
                >
                  <UpdateIcon color="action" fontSize="small" />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Última Actualización
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {new Date(request.lastUpdate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Box
              sx={{
                bgcolor: "primary.50",
                border: "1px solid",
                borderColor: "primary.100",
                borderRadius: 3,
                p: 2,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <ChatBubbleOutlineIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Actualización del Equipo SmartAdopt
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {request.updateMessage}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid",
                borderColor: "grey.100",
                pt: 3,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Próximo Paso
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {request.nextStep}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => onViewDetails?.(request)}
                startIcon={<VisibilityIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: "grey.300",
                }}
              >
                Ver Detalles
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
};
