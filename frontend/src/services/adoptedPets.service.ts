import type { AIProfileResponse } from "../types/pets.types";

const LOCAL_STORAGE_KEY = "smartadopt_adopted_pets";

export interface AdoptedPet {
  id: string;
  petName: string;
  breed: string;
  age: string;
  adoptedDate: string;
  newFamily: string;
  adopterEmail?: string;
  adopterPhone?: string;
  image: string;
}

export const adoptedPetsService = {
  getAdoptedPets: (): AdoptedPet[] => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  addAdoptedPet: (
    petData: AIProfileResponse,
    familyName: string,
    email?: string,
    phone?: string
  ): void => {
    const pets = adoptedPetsService.getAdoptedPets();

    const newAdoptedPet: AdoptedPet = {
      id: `adopted_${Date.now()}`,
      petName: petData.pet.name,
      breed:
        petData.pet.animal_breed.length > 0
          ? petData.pet.animal_breed[0]
          : "Desconocida",
      age: `${petData.pet.age} años`,
      adoptedDate: new Date().toLocaleDateString(),
      newFamily: familyName,
      adopterEmail: email,
      adopterPhone: phone,
      image: petData.pet.pet_image_url || "",
    };

    pets.unshift(newAdoptedPet);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pets));
  },
};
