// src/types/suitability.types.ts

import { z } from "zod";

export const suitabilitySchema = z
  .object({
    // Phase 1: Candidate Information
    cityNeighborhood: z.string().min(1, "La ciudad/barrio es requerida"),
    address: z.string().min(1, "El domicilio es requerido"),
    employmentStatus: z.string().min(1, "La situación laboral es requerida"),
    employmentStatusOther: z.string().optional(),
    housingType: z.string().min(1, "El tipo de vivienda es requerido"),
    housingTypeOther: z.string().optional(),
    hasNaturalSpace: z.string().min(1, "Esta opción es requerida"),

    // Phase 2: Coexistence and Experience
    hasPets: z.string().min(1, "Esta opción es requerida"),
    petsDetails: z.string().optional(),
    homeEnergyLevel: z.string().min(1, "El nivel de energía es requerido"),
    hasChildren: z.string().min(1, "Esta opción es requerida"),
    childrenAges: z.string().optional(),
    longTermCommitment: z.string().min(1, "Esta opción es requerida"),

    // Phase 3: Pet Preferences
    preferredSpecies: z.string().min(1, "Esta opción es requerida"),
    preferredGender: z.string().min(1, "Esta opción es requerida"),
    preferredEnergy: z.string().min(1, "Esta opción es requerida"),

    // Phase 4: Logistics and Education
    dailyTimeCommitment: z.string().min(1, "Esta opción es requerida"),
    sleepingLocation: z.string().min(1, "Esta opción es requerida"),
    sleepingLocationOther: z.string().optional(),
    behaviorProblemAction: z.string().min(1, "Esta opción es requerida"),
    behaviorProblemActionOther: z.string().optional(),
    emergencyPlan: z.string().min(1, "Esta opción es requerida"),
    emergencyPlanOther: z.string().optional(),

    // Phase 5: Final Motivation
    adoptionMotivation: z.string().min(1, "La motivación es requerida"),
  })
  .superRefine((data, ctx) => {
    // Conditional validations
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

// ============================================================
// Backend API Interfaces
// ============================================================

/**
 * Request body for POST /adoption-forms/submit
 * Matches the backend AdoptionFormRequest Pydantic schema exactly.
 * Note: user_id is extracted from JWT — never sent in the body.
 */
export interface BackendAdoptionFormRequest {
  // I. Candidate Information
  neighborhood: string;
  address: string;
  employment_status: string; // "employed" | "independent"
  employment_status_other?: string;
  housing_type: string; // "apartment" | "rented_house" | "own_house"
  housing_type_other?: string;
  has_natural_space: boolean;
  // II. Coexistence and Experience
  has_pets: boolean;
  current_pets_details?: string;
  household_energy: string; // "very_active" | "moderate" | "quiet"
  has_children: boolean;
  children_ages?: number[];
  long_term_commitment: boolean;
  // III. Pet Preferences
  preferred_species: string; // "dog" | "cat" | "no_preference"
  preferred_gender: string; // "male" | "female" | "no_preference"
  preferred_energy: string; // "low" | "medium" | "high"
  // IV. Logistics and Education
  daily_time_dedication: string; // ">2" | "2-6" | "6+"
  sleeping_location: string; // "inside" | "patio" | "other"
  sleeping_location_other?: string;
  behavior_approach: string; // "positive_education" | "trainer" | "other"
  behavior_approach_other?: string;
  emergency_plan: string; // "family_friend" | "kennel" | "take_with_me" | "other"
  emergency_plan_other?: string;
  // V. Final Motivation
  motivation: string;
}

/**
 * Request body for PUT /adoption-forms/me
 * All fields are optional (partial update).
 */
export type BackendAdoptionFormUpdateRequest =
  Partial<BackendAdoptionFormRequest>;

/**
 * Response from POST /adoption-forms/submit
 */
export interface AdoptionFormSubmitResponse {
  message: string;
  form_id: string | null;
  submission_date: string | null;
}

/**
 * Response from GET /adoption-forms/me
 * Returns the full form document stored in MongoDB (without _id).
 */
export interface AdoptionFormGetResponse {
  user_id: number;
  neighborhood: string;
  address: string;
  employment_status: string;
  employment_status_other?: string | null;
  housing_type: string;
  housing_type_other?: string | null;
  has_natural_space: boolean;
  has_pets: boolean;
  current_pets_details?: string | null;
  household_energy: string;
  has_children: boolean;
  children_ages?: number[] | null;
  long_term_commitment: boolean;
  preferred_species: string;
  preferred_gender: string;
  preferred_energy: string;
  daily_time_dedication: string;
  sleeping_location: string;
  sleeping_location_other?: string | null;
  behavior_approach: string;
  behavior_approach_other?: string | null;
  emergency_plan: string;
  emergency_plan_other?: string | null;
  motivation: string;
  submission_date: string;
  last_updated: string;
}

/**
 * Response from PUT /adoption-forms/me
 */
export interface AdoptionFormUpdateResponse {
  message: string;
  form: AdoptionFormGetResponse;
}

// ============================================================
// Mapping: Spanish UI labels → Backend enum values
// ============================================================

const employmentStatusMap: Record<string, string> = {
  Empleado: "employed",
  Independiente: "independent",
};

const housingTypeMap: Record<string, string> = {
  Departamento: "apartment",
  "Casa en renta(con permiso de tener mascota)": "rented_house",
  "Casa propia": "own_house",
};

const householdEnergyMap: Record<string, string> = {
  "Muy activo (deportes, paseos largos)": "very_active",
  "Moderado (caminatas diarias)": "moderate",
  "Tranquilo (casa)": "quiet",
};

const preferredSpeciesMap: Record<string, string> = {
  Perro: "dog",
  Gato: "cat",
  "Sin preferencia": "no_preference",
};

const preferredGenderMap: Record<string, string> = {
  Macho: "male",
  Hembra: "female",
  "Sin preferencia": "no_preference",
};

const preferredEnergyMap: Record<string, string> = {
  "Baja (Tranquilo)": "low",
  "Media (Juguetón)": "medium",
  "Alta (Muy activo)": "high",
};

const dailyTimeMap: Record<string, string> = {
  "< 2 horas": ">2",
  "2 - 6 horas": "2-6",
  "> 6 horas": "6+",
};

const sleepingLocationMap: Record<string, string> = {
  "Dentro de casa/cama": "inside",
  Patio: "patio",
  Otro: "other",
};

const behaviorApproachMap: Record<string, string> = {
  "Refuerzo positivo/Educación": "positive_education",
  "Contratar adiestrador": "trainer",
  Otro: "other",
};

const emergencyPlanMap: Record<string, string> = {
  "Familiar/Amigo": "family_friend",
  Guardería: "kennel",
  "Me la llevo conmigo": "take_with_me",
  Otro: "other",
};

/**
 * Helper to reverse a Record<string, string> map.
 */
const reverseMap = (map: Record<string, string>): Record<string, string> => {
  const reversed: Record<string, string> = {};
  for (const [key, value] of Object.entries(map)) {
    reversed[value] = key;
  }
  return reversed;
};

// Reverse maps: backend enum → Spanish UI label
const employmentStatusReverseMap = reverseMap(employmentStatusMap);
const housingTypeReverseMap = reverseMap(housingTypeMap);
const householdEnergyReverseMap = reverseMap(householdEnergyMap);
const preferredSpeciesReverseMap = reverseMap(preferredSpeciesMap);
const preferredGenderReverseMap = reverseMap(preferredGenderMap);
const preferredEnergyReverseMap = reverseMap(preferredEnergyMap);
const dailyTimeReverseMap = reverseMap(dailyTimeMap);
const sleepingLocationReverseMap = reverseMap(sleepingLocationMap);
const behaviorApproachReverseMap = reverseMap(behaviorApproachMap);
const emergencyPlanReverseMap = reverseMap(emergencyPlanMap);

// ============================================================
// Forward Mapper: Survey UI data → Backend request
// ============================================================

export const mapSurveyToBackendRequest = (
  data: SuitabilitySurveyData,
): BackendAdoptionFormRequest => {
  // Parse children ages if any
  let childrenAgesList: number[] | undefined = undefined;
  if (data.hasChildren === "Sí" && data.childrenAges) {
    childrenAgesList = data.childrenAges
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
  }

  return {
    neighborhood: data.cityNeighborhood,
    address: data.address,
    employment_status:
      employmentStatusMap[data.employmentStatus] || data.employmentStatus,
    housing_type: housingTypeMap[data.housingType] || data.housingType,
    has_natural_space: data.hasNaturalSpace === "Sí",
    has_pets: data.hasPets === "Sí",
    household_energy:
      householdEnergyMap[data.homeEnergyLevel] || data.homeEnergyLevel,
    has_children: data.hasChildren === "Sí",
    long_term_commitment: data.longTermCommitment === "Sí",
    preferred_species:
      preferredSpeciesMap[data.preferredSpecies] || data.preferredSpecies,
    preferred_gender:
      preferredGenderMap[data.preferredGender] || data.preferredGender,
    preferred_energy:
      preferredEnergyMap[data.preferredEnergy] || data.preferredEnergy,
    daily_time_dedication:
      dailyTimeMap[data.dailyTimeCommitment] || data.dailyTimeCommitment,
    sleeping_location:
      sleepingLocationMap[data.sleepingLocation] || data.sleepingLocation,
    behavior_approach:
      behaviorApproachMap[data.behaviorProblemAction] ||
      data.behaviorProblemAction,
    emergency_plan: emergencyPlanMap[data.emergencyPlan] || data.emergencyPlan,
    motivation: data.adoptionMotivation,
    employment_status_other: data.employmentStatusOther || undefined,
    housing_type_other: data.housingTypeOther || undefined,
    current_pets_details: data.petsDetails || undefined,
    children_ages: childrenAgesList,
    sleeping_location_other: data.sleepingLocationOther || undefined,
    behavior_approach_other: data.behaviorProblemActionOther || undefined,
    emergency_plan_other: data.emergencyPlanOther || undefined,
  };
};

// ============================================================
// Reverse Mapper: Backend response → Survey UI data
// ============================================================

export const mapBackendResponseToSurvey = (
  data: AdoptionFormGetResponse,
): SuitabilitySurveyData => {
  return {
    cityNeighborhood: data.neighborhood,
    address: data.address,
    employmentStatus:
      employmentStatusReverseMap[data.employment_status] ||
      data.employment_status,
    employmentStatusOther: data.employment_status_other || undefined,
    housingType: housingTypeReverseMap[data.housing_type] || data.housing_type,
    housingTypeOther: data.housing_type_other || undefined,
    hasNaturalSpace: data.has_natural_space ? "Sí" : "No",
    hasPets: data.has_pets ? "Sí" : "No",
    petsDetails: data.current_pets_details || undefined,
    homeEnergyLevel:
      householdEnergyReverseMap[data.household_energy] || data.household_energy,
    hasChildren: data.has_children ? "Sí" : "No",
    childrenAges: data.children_ages
      ? data.children_ages.join(", ")
      : undefined,
    longTermCommitment: data.long_term_commitment ? "Sí" : "No",
    preferredSpecies:
      preferredSpeciesReverseMap[data.preferred_species] ||
      data.preferred_species,
    preferredGender:
      preferredGenderReverseMap[data.preferred_gender] || data.preferred_gender,
    preferredEnergy:
      preferredEnergyReverseMap[data.preferred_energy] || data.preferred_energy,
    dailyTimeCommitment:
      dailyTimeReverseMap[data.daily_time_dedication] ||
      data.daily_time_dedication,
    sleepingLocation:
      sleepingLocationReverseMap[data.sleeping_location] ||
      data.sleeping_location,
    sleepingLocationOther: data.sleeping_location_other || undefined,
    behaviorProblemAction:
      behaviorApproachReverseMap[data.behavior_approach] ||
      data.behavior_approach,
    behaviorProblemActionOther: data.behavior_approach_other || undefined,
    emergencyPlan:
      emergencyPlanReverseMap[data.emergency_plan] || data.emergency_plan,
    emergencyPlanOther: data.emergency_plan_other || undefined,
    adoptionMotivation: data.motivation,
  };
};
