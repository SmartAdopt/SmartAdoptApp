// src/types/dashboard.types.ts

export interface Pet {
  id: string;
  nombre: string;
  raza: string;
  edad: string;
  genero: "Macho" | "Hembra";
  ubicacion: string;
  imagen: string;
}

export interface Article {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  minutosLectura: number;
  imagen: string;
}

export interface Notification {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
}

export interface Event {
  id: string;
  titulo: string;
  lugar: string;
  fecha: string;
  hora: string;
}
