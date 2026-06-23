// src/utils/pets.adapters.ts

import type { PetRegistrationRequest, PetFormData } from "../types/pets.types";

/**
 * Adapts the Spanish UI form data into the strict English payload
 * expected by FastAPI's PetRegisterRequest Pydantic model.
 */
export const adaptPetFormToBackend = (
  formData: PetFormData,
  uploadedImageUrl: string,
): PetRegistrationRequest => {
  return {
    name: formData.nombre,
    pet_image_url: uploadedImageUrl,
    // The backend expects the animal breed as an array where the first item is the species
    animal_breed: [formData.especie === "Perro" ? "dog" : "cat", formData.raza],
    age: Number(formData.edad),
    gender: formData.genero === "Macho" ? "male" : "female",
    is_sterilized: formData.esterilizado,
    vaccines_up_to_date: formData.vacunas,
    dewormed: formData.desparasitado,
    weight_kg: Number(formData.peso),
    special_conditions: formData.condicionesEspeciales
      ? formData.condicionesEspeciales
          .split(",")
          .map((cond: string) => cond.trim())
          .filter((cond: string) => cond.length > 0)
      : ["none"],
    brief_description: formData.biografia,
  };
};
