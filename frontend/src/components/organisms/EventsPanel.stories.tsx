// src/components/organisms/EventsPanel.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { EventsPanel } from "./EventsPanel";
import { dashboardService } from "../../services/dashboard.service";
import { type Event } from "../../types/dashboard.types";
import { MemoryRouter } from "react-router-dom";

/**
 * MOCK DATA
 * Represents the expected payload from the dashboardService.getEvents() endpoint.
 * Content is in Spanish as per the application requirements.
 */
const mockEvents: Event[] = [
  {
    id: "e1",
    titulo: "Jornada de Adopción",
    lugar: "Parque La Carolina",
    fecha: "2026-07-15",
    hora: "10:00 AM",
  },
  {
    id: "e2",
    titulo: "Vacunación Gratuita",
    lugar: "Centro Comunitario Norte",
    fecha: "2026-07-20",
    hora: "09:00 AM",
  },
];

/**
 * Storybook Metadata Configuration
 * Atomic Level: Organism
 */
const meta = {
  title: "Organisms/EventsPanel",
  component: EventsPanel,
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#F9FAFB" }],
    },
  },
  decorators: [
    (Story, context) => {
      // Mock setup: Override the service method to prevent real API calls
      dashboardService.getEvents = async () => {
        return context.parameters.mockData ?? mockEvents;
      };

      return (
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      );
    },
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof EventsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default View
 * Displays the panel populated with upcoming events.
 */
export const Default: Story = {};

/**
 * Mobile View
 * Validates responsive design for small viewports.
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

/**
 * Empty State
 * Verifies how the organism behaves when there are no scheduled events.
 */
export const Empty: Story = {
  parameters: {
    mockData: [],
  },
};
