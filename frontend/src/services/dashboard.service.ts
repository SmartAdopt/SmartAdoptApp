// services/dashboard.service.ts

import articleImage from "../assets/placeholders/article.svg";
import { PUBLIC_ASSETS } from "../utils/publicAssets";

import type {
  Pet,
  Article,
  Notification,
  Event,
} from "../types/dashboard.types";

export const dashboardService = {
  async getFeaturedPets(): Promise<Pet[]> {
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
