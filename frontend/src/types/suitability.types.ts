// src/types/suitability.types.ts

import { z } from "zod";

export const suitabilitySchema = z
  .object({
    // Phase 1: Información del Candidato
    cityNeighborhood: z.string().min(1, "La ciudad/barrio es requerida"),
    address: z.string().min(1, "El domicilio es requerido"),
    employmentStatus: z.string().min(1, "La situación laboral es requerida"),
    employmentStatusOther: z.string().optional(),
    housingType: z.string().min(1, "El tipo de vivienda es requerido"),
    housingTypeOther: z.string().optional(),
    hasNaturalSpace: z.string().min(1, "Esta opción es requerida"),

    // Phase 2: Convivencia y Experiencia
    hasPets: z.string().min(1, "Esta opción es requerida"),
    petsDetails: z.string().optional(),
    homeEnergyLevel: z.string().min(1, "El nivel de energía es requerido"),
    hasChildren: z.string().min(1, "Esta opción es requerida"),
    childrenAges: z.string().optional(),
    longTermCommitment: z.string().min(1, "Esta opción es requerida"),

    // Phase 3: Preferencias de la Mascota
    preferredSpecies: z.string().min(1, "Esta opción es requerida"),
    preferredGender: z.string().min(1, "Esta opción es requerida"),
    preferredEnergy: z.string().min(1, "Esta opción es requerida"),

    // Phase 4: Logística y Educación
    dailyTimeCommitment: z.string().min(1, "Esta opción es requerida"),
    sleepingLocation: z.string().min(1, "Esta opción es requerida"),
    sleepingLocationOther: z.string().optional(),
    behaviorProblemAction: z.string().min(1, "Esta opción es requerida"),
    behaviorProblemActionOther: z.string().optional(),
    emergencyPlan: z.string().min(1, "Esta opción es requerida"),
    emergencyPlanOther: z.string().optional(),

    // Phase 5: Motivación Final
    adoptionMotivation: z.string().min(1, "La motivación es requerida"),
  })
  .superRefine((data, ctx) => {
    // Validaciones condicionales
    if (
      data.employmentStatus === "Otro" &&
      (!data.employmentStatusOther || data.employmentStatusOther.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Por favor especifique su situación laboral",
        path: ["employmentStatusOther"],
      });
    }
    if (
      data.housingType === "Otro" &&
      (!data.housingTypeOther || data.housingTypeOther.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Por favor especifique el tipo de vivienda",
        path: ["housingTypeOther"],
      });
    }
    if (
      data.hasPets === "Sí" &&
      (!data.petsDetails || data.petsDetails.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Por favor especifique los detalles de sus mascotas",
        path: ["petsDetails"],
      });
    }
    if (
      data.hasChildren === "Sí" &&
      (!data.childrenAges || data.childrenAges.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Por favor especifique las edades",
        path: ["childrenAges"],
      });
    }
    if (
      data.sleepingLocation === "Otro" &&
      (!data.sleepingLocationOther || data.sleepingLocationOther.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Por favor especifique el lugar",
        path: ["sleepingLocationOther"],
      });
    }
    if (
      data.behaviorProblemAction === "Otro" &&
      (!data.behaviorProblemActionOther ||
        data.behaviorProblemActionOther.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Por favor especifique",
        path: ["behaviorProblemActionOther"],
      });
    }
    if (
      data.emergencyPlan === "Otro" &&
      (!data.emergencyPlanOther || data.emergencyPlanOther.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Por favor especifique",
        path: ["emergencyPlanOther"],
      });
    }
  });

export type SuitabilitySurveyData = z.infer<typeof suitabilitySchema>;

export const initialSurveyData: SuitabilitySurveyData = {
  cityNeighborhood: "",
  address: "",
  employmentStatus: "",
  housingType: "",
  hasNaturalSpace: "",

  hasPets: "",
  homeEnergyLevel: "",
  hasChildren: "",
  longTermCommitment: "",

  preferredSpecies: "",
  preferredGender: "",
  preferredEnergy: "",

  dailyTimeCommitment: "",
  sleepingLocation: "",
  behaviorProblemAction: "",
  emergencyPlan: "",

  adoptionMotivation: "",
};

export interface BackendSuitabilityRequest {
  user_id: number;
  neighborhood: string;
  address: string;
  employment_status: string;
  housing_type: string;
  has_natural_space: boolean;
  has_pets: boolean;
  household_energy: string;
  has_children: boolean;
  long_term_commitment: boolean;
  preferred_species: string;
  preferred_gender: string;
  preferred_energy: string;
  daily_time_dedication: number;
  sleeping_location: string;
  behavior_approach: string;
  emergency_plan: string;
  motivation: string;
  employment_status_other?: string;
  housing_type_other?: string;
  current_pets_details?: string;
  children_ages?: number[];
  sleeping_location_other?: string;
  behavior_approach_other?: string;
  emergency_plan_other?: string;
  submission_date?: string;
  last_updated?: string;
}

export const mapSurveyToBackendRequest = (
  data: SuitabilitySurveyData,
  userId: number,
): BackendSuitabilityRequest => {
  // Parse hours from the string
  let dailyTime = 0;
  if (data.dailyTimeCommitment.includes("< 2")) dailyTime = 2;
  else if (data.dailyTimeCommitment.includes("2 - 6")) dailyTime = 6;
  else if (data.dailyTimeCommitment.includes("> 6")) dailyTime = 8;

  // Parse children ages if any
  let childrenAgesList: number[] | undefined = undefined;
  if (data.hasChildren === "Sí" && data.childrenAges) {
    childrenAgesList = data.childrenAges
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
  }

  const now = new Date().toISOString();

  return {
    user_id: userId,
    neighborhood: data.cityNeighborhood,
    address: data.address,
    employment_status: data.employmentStatus,
    housing_type: data.housingType,
    has_natural_space: data.hasNaturalSpace === "Sí",
    has_pets: data.hasPets === "Sí",
    household_energy: data.homeEnergyLevel,
    has_children: data.hasChildren === "Sí",
    long_term_commitment: data.longTermCommitment === "Sí",
    preferred_species: data.preferredSpecies,
    preferred_gender: data.preferredGender,
    preferred_energy: data.preferredEnergy,
    daily_time_dedication: dailyTime,
    sleeping_location: data.sleepingLocation,
    behavior_approach: data.behaviorProblemAction,
    emergency_plan: data.emergencyPlan,
    motivation: data.adoptionMotivation,
    employment_status_other: data.employmentStatusOther || undefined,
    housing_type_other: data.housingTypeOther || undefined,
    current_pets_details: data.petsDetails || undefined,
    children_ages: childrenAgesList,
    sleeping_location_other: data.sleepingLocationOther || undefined,
    behavior_approach_other: data.behaviorProblemActionOther || undefined,
    emergency_plan_other: data.emergencyPlanOther || undefined,
    submission_date: now,
    last_updated: now,
  };
};
