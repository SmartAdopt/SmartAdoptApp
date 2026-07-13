// services/dashboard.service.ts

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
        return [];
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
      return [];
    }
  },

  async getArticles(): Promise<Article[]> {
    return [];
  },

  /**
   * @deprecated Use notificationService.getNotifications instead.
   */
  async getNotifications(): Promise<Notification[]> {
    const data = localStorage.getItem("smartadopt_notifications");
    return data ? JSON.parse(data) : [];
  },

  /**
   * @deprecated Use notificationService.markAsRead / Backend APIs instead.
   */
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
    return [];
  },
};
