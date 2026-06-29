// src/components/organisms/DonationPanel.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { DonationPanel } from "./DonationPanel";

/**
 * Storybook Metadata Configuration
 * Atomic Level: Organism
 * This component provides a call-to-action for financial support to the foundation.
 */
const meta = {
  title: "Organisms/DonationPanel",
  component: DonationPanel,
  parameters: {
    // Padded layout provides a clear boundary for the panel
    layout: "padded",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#F9FAFB" }],
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DonationPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default View
 * Displays the donation panel as it would appear on larger desktop screens.
 */
export const Desktop: Story = {};

/**
 * Mobile View
 * Validates the panel's responsive layout within a constrained viewport.
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
