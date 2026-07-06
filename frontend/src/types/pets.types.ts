// src/types/pets.types.ts

// ==========================================
// API REQUEST MODELS (What we send to FastAPI)
// ==========================================
export interface PetRegistrationRequest {
  name: string;
  pet_image_url: string; // The URL obtained after uploading to Backblaze B2
  animal_breed: string[]; // e.g., ["dog"]
  age: number; // Max 20
  gender: "male" | "female";
  is_sterilized: boolean;
  vaccines_up_to_date: string[];
  dewormed: boolean;
  weight_kg: number; // Max 45
  special_conditions: string[];
  brief_description: string;
}

// ==========================================
// API RESPONSE MODELS (What FastAPI returns)
// ==========================================
export interface AIProfileResponse {
  id: string; // e.g., "PR2"
  title: string;
  tags: string[];
  emotional_description: string;
  status: string; // e.g., "available"
  creation_date: string;
  pet: PetRegistrationRequest;
}

export interface PetRegistrationResponse {
  message: string;
  profile: AIProfileResponse;
}

// ==========================================
// FORM DATA TYPE (Frontend form → adapter)
// ==========================================
export interface PetFormData {
  especie: "Perro" | "Gato";
  nombre: string;
  raza: string;
  edad: number;
  peso: number;
  genero: "Macho" | "Hembra";
  ubicacion: string;
  esterilizado: boolean;
  desparasitado: boolean;
  vacunas: string[];
  condicionesEspeciales?: string;
  biografia: string;
}
