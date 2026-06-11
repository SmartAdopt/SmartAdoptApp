// services/dashboard.service.ts

import dogImage from "../assets/placeholders/dog.svg";
import catImage from "../assets/placeholders/cat.svg";
import articleImage from "../assets/placeholders/article.svg";

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
        imagen: dogImage,
      },
      {
        id: "2",
        nombre: "Luna",
        raza: "Siamés",
        edad: "2 años",
        genero: "Hembra",
        ubicacion: "Cuenca",
        imagen: catImage,
      },
      {
        id: "3",
        nombre: "Rocky",
        raza: "Labrador",
        edad: "4 años",
        genero: "Macho",
        ubicacion: "Loja",
        imagen: dogImage,
      },
    ];
  },

  async getArticles(): Promise<Article[]> {
    return [
      {
        id: "1",
        titulo: "Cómo preparar tu hogar para una adopción",
        descripcion:
          "Consejos esenciales para recibir una mascota en casa.",
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
        descripcion:
          "Errores comunes que debes evitar durante la adaptación.",
        categoria: "Consejos",
        minutosLectura: 7,
        imagen: articleImage,
      },
    ];
  },

  async getNotifications(): Promise<Notification[]> {
    return [
      {
        id: "1",
        titulo: "Nueva coincidencia",
        descripcion: "Max coincide con tus preferencias.",
        fecha: "Hace 2 horas",
      },
      {
        id: "2",
        titulo: "Solicitud actualizada",
        descripcion: "Tu solicitud fue revisada.",
        fecha: "Hace 1 día",
      },
      {
        id: "3",
        titulo: "Nueva mascota",
        descripcion: "Se agregó una mascota cercana.",
        fecha: "Hace 2 días",
      },
    ];
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