// services/dashboard.service.ts

import articleImage from "../assets/placeholders/article.svg";
import { PUBLIC_ASSETS } from "../utils/publicAssets";

import { petsService } from "./pets.service";
import type {
  Pet,
  Article,
  Notification,
  Event,
} from "../types/dashboard.types";

export const dashboardService = {
  async getFeaturedPets(): Promise<Pet[]> {
    try {
      // If user is not logged in, return mocks to avoid 401 errors on public pages
      if (!localStorage.getItem("access_token")) {
        throw new Error("No authentication token found");
      }

      const allPets = await petsService.getRawPetsDatabase();
      const availablePets = allPets.filter((p) => p.status === "available");
      return availablePets.slice(0, 3).map((p) => ({
        id: p.id,
        nombre: p.pet.name,
        raza: p.pet.animal_breed?.[0] || "Desconocida",
        edad: `${p.pet.age} años`,
        genero: p.pet.gender === "male" ? "Macho" : "Hembra",
        ubicacion: "Fundación SmartAdopt",
        imagen: p.pet.pet_image_url || PUBLIC_ASSETS.dog,
        peso: `${p.pet.weight_kg} kg`,
        esterilizado: p.pet.is_sterilized,
        vacunado: p.pet.vaccines_up_to_date?.length > 0,
        biografia: p.emotional_description,
      }));
    } catch (error) {
      console.error("Error fetching real featured pets:", error);
      // Fallback to mocks if backend fails
      return [
        {
          id: "1",
          nombre: "Max",
          raza: "Golden Retriever",
          edad: "3 años",
          genero: "Macho",
          ubicacion: "Quito",
          imagen: PUBLIC_ASSETS.dog,
        },
        {
          id: "2",
          nombre: "Luna",
          raza: "Siamés",
          edad: "2 años",
          genero: "Hembra",
          ubicacion: "Cuenca",
          imagen: PUBLIC_ASSETS.cat,
        },
        {
          id: "3",
          nombre: "Rocky",
          raza: "Labrador",
          edad: "4 años",
          genero: "Macho",
          ubicacion: "Loja",
          imagen: PUBLIC_ASSETS.dog,
        },
      ];
    }
  },

  async getArticles(): Promise<Article[]> {
    return [
      {
        id: "1",
        titulo: "Cómo preparar tu hogar para una adopción",
        descripcion: "Consejos esenciales para recibir una mascota en casa.",
        categoria: "Guía",
        minutosLectura: 5,
        imagen: articleImage,
      },

      {
        id: "2",
        titulo: "Beneficios emocionales de adoptar",
        descripcion:
          "Descubre cómo una mascota puede mejorar tu bienestar emocional.",
        categoria: "Bienestar",
        minutosLectura: 4,
        imagen: articleImage,
      },

      {
        id: "3",
        titulo: "Primeros días con tu nueva mascota",
        descripcion: "Errores comunes que debes evitar durante la adaptación.",
        categoria: "Consejos",
        minutosLectura: 7,
        imagen: articleImage,
      },
    ];
  },

  async getNotifications(): Promise<Notification[]> {
    const data = localStorage.getItem("smartadopt_notifications");
    return data ? JSON.parse(data) : [];
  },

  async addNotification(titulo: string, descripcion: string): Promise<void> {
    const notifications = await this.getNotifications();
    const newNotification: Notification = {
      id: `notif_${Date.now()}`,
      titulo,
      descripcion,
      fecha: "Justo ahora",
    };
    notifications.unshift(newNotification); // add to top
    localStorage.setItem(
      "smartadopt_notifications",
      JSON.stringify(notifications)
    );
  },

  async getEvents(): Promise<Event[]> {
    return [
      {
        id: "1",
        titulo: "Jornada de Adopción",
        lugar: "Parque La Carolina",
        fecha: "22 JUN",
        hora: "10:00 - 15:00",
      },
      {
        id: "2",
        titulo: "Taller de Cuidado",
        lugar: "Fundación Patitas",
        fecha: "28 JUN",
        hora: "14:00 - 17:00",
      },
    ];
  },
};
