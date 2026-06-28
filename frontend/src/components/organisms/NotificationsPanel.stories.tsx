// src/components/organisms/NotificationsPanel.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { NotificationsPanel } from "./NotificationsPanel";
import { dashboardService } from "../../services/dashboard.service";
import { MemoryRouter } from "react-router-dom";

/**
 * MOCK DATA
 * Represents the expected structure of notification entities for UI verification.
 */
const mockNotifications = [
  {
    id: "n-1",
    titulo: "Solicitud Aprobada",
    descripcion:
      "Tu solicitud para adoptar a Max ha sido aprobada por la fundación.",
    fecha: "2026-06-27",
  },
  {
    id: "n-2",
    titulo: "Nuevo Candidato",
    descripcion:
      "Se ha registrado un nuevo candidato interesado en tu mascota 'Luna'.",
    fecha: "2026-06-26",
  },
];

/**
 * Storybook Metadata Configuration
 * Atomic Level: Organism
 */
const meta = {
  title: "Organisms/NotificationsPanel",
  component: NotificationsPanel,
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#F9FAFB" }],
    },
  },
  decorators: [
    (Story, context) => {
      // INTERCEPTOR: Mock the dashboard service before the component mounts
      dashboardService.getNotifications = async () => {
        return context.parameters.mockData ?? mockNotifications;
      };

      // Wrap in Router in case underlying components use routing hooks
      return (
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      );
    },
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof NotificationsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default View
 * Displays the panel populated with the mock data above.
 */
export const Default: Story = {};

/**
 * Empty State
 * Verifies component behavior when no notifications exist.
 */
export const Empty: Story = {
  parameters: {
    mockData: [],
  },
};
