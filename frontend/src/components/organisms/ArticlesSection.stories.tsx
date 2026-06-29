// src/components/organisms/ArticlesSection.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { ArticlesSection } from "./ArticlesSection";
import { dashboardService } from "../../services/dashboard.service";
import { type Article } from "../../types/dashboard.types";
import { MemoryRouter } from "react-router-dom";

/**
 * MOCK DATA
 * Represents the expected payload from the dashboardService.getArticles() endpoint.
 */
const mockArticles: Article[] = [
  {
    id: "art-1",
    titulo: "Cuidados básicos para tu nuevo perro",
    descripcion:
      "Descubre todo lo que necesitas saber antes de llevar a tu nuevo mejor amigo a casa. Tips de alimentación y paseos.",
    categoria: "Guías de Adopción",
    minutosLectura: 5,
    imagen:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "art-2",
    titulo: "Adaptación de gatos rescatados",
    descripcion:
      "Estrategias comprobadas para ayudar a un gato tímido o asustadizo a ganar confianza en su nuevo entorno.",
    categoria: "Comportamiento",
    minutosLectura: 8,
    imagen:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "art-3",
    titulo: "La importancia de la esterilización",
    descripcion:
      "Conoce los beneficios de salud a largo plazo y cómo ayuda a controlar la sobrepoblación animal en la ciudad.",
    categoria: "Salud",
    minutosLectura: 4,
    imagen:
      "https://images.unsplash.com/photo-1537151608804-ea6f117ce324?auto=format&fit=crop&q=80&w=400",
  },
];

/**
 * Storybook Metadata Configuration
 */
const meta = {
  title: "Organisms/ArticlesSection",
  component: ArticlesSection,
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#F9FAFB" }],
    },
  },
  decorators: [
    (Story, context) => {
      // MOCK SETUP: Override the service method
      dashboardService.getArticles = async () => {
        return context.parameters.mockData ?? mockArticles;
      };

      return (
        // Wrapper required because ArticleCard uses useNavigate()
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      );
    },
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof ArticlesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default View
 */
export const Default: Story = {};

/**
 * Empty State
 */
export const Empty: Story = {
  parameters: {
    mockData: [],
  },
};
