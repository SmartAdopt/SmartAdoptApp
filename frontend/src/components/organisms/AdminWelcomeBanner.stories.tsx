// src/components/organisms/AdminWelcomeBanner.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { AdminWelcomeBanner } from "./AdminWelcomeBanner";

/**
 * Storybook Metadata Configuration
 * Organism: AdminWelcomeBanner
 * This component currently uses static text. In a production environment,
 * the metrics (available pets, pending requests) should ideally be passed as props.
 */
const meta = {
  title: "Organisms/AdminWelcomeBanner",
  component: AdminWelcomeBanner,
  parameters: {
    // Padded layout prevents the banner from touching the absolute edges of the canvas
    layout: "padded",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#F9FAFB" }],
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AdminWelcomeBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default Desktop View
 * Demonstrates the full-width row layout with space-between alignment.
 */
export const Desktop: Story = {};

/**
 * Mobile View
 * Validates the responsive design, ensuring the layout switches to a column
 * and elements align to the start.
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
