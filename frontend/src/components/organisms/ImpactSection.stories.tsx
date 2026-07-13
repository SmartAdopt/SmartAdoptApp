// src/components/organisms/ImpactSection.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { ImpactSection } from "./ImpactSection";

/**
 * Storybook Metadata Configuration
 * Atomic Level: Organism
 * This organism displays the foundation's key performance metrics to the public user.
 */
const meta = {
  title: "Organisms/ImpactSection",
  component: ImpactSection,
  parameters: {
    // Padded layout is suitable for container-based sections
    layout: "padded",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#FFFFFF" }],
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ImpactSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default View
 * Displays the impact metrics as they appear on desktop viewports.
 */
export const Default: Story = {};

/**
 * Mobile View
 * Validates responsive design for small screens, confirming column stacking.
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
