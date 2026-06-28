// src/components/organisms/CommunityImpact.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { CommunityImpact } from "./CommunityImpact";

/**
 * Storybook Metadata Configuration
 * Atomic Level: Organism
 * This organism displays community statistics using 'StatCard' atoms.
 */
const meta = {
  title: "Organisms/CommunityImpact",
  component: CommunityImpact,
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#F9FAFB" }],
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CommunityImpact>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default View
 * Displays the statistics grid. This represents the current state of the community impact.
 */
export const Default: Story = {};

/**
 * Mobile View
 * Ensures the Grid layout stacks the stat cards vertically on small screens
 * as expected by the responsive design.
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
