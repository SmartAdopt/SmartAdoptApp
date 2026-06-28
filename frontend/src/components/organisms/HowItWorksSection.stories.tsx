// src/components/organisms/HowItWorksSection.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { HowItWorksSection } from "./HowItWorksSection";

/**
 * Storybook Metadata Configuration
 * Atomic Level: Organism
 * This organism displays the core operational workflow of the SmartAdopt platform.
 */
const meta = {
  title: "Organisms/HowItWorksSection",
  component: HowItWorksSection,
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#FFFFFF" }],
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HowItWorksSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default View
 * Displays the full three-step workflow of the platform.
 */
export const Default: Story = {};

/**
 * Mobile View
 * Validates responsive grid stacking on smaller viewports.
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
