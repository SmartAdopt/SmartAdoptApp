// src/components/organisms/HeroSection.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { HeroSection } from "./HeroSection";

/**
 * Storybook Metadata Configuration
 * Atomic Level: Organism
 * The HeroSection is a layout organism responsible for primary landing page entry.
 */
const meta = {
  title: "Organisms/HeroSection",
  component: HeroSection,
  parameters: {
    // Fullscreen layout is best for hero sections to test full-width behavior
    layout: "fullscreen",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#FFFFFF" }],
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default View
 * Displays the hero section as it appears on desktop.
 */
export const Default: Story = {};

/**
 * Mobile View
 * Validates the vertical flex-direction and responsive typography constraints.
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
