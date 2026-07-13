// src/components/organisms/QuickActionsPanel.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { QuickActionsPanel } from "./QuickActionsPanel";
import { MemoryRouter } from "react-router-dom";

/**
 * Storybook Metadata Configuration
 * Atomic Level: Organism
 * This component organizes navigation atoms into a functional dashboard panel
 * to streamline user access to primary adoption tasks.
 */
const meta = {
  title: "Organisms/QuickActionsPanel",
  component: QuickActionsPanel,
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#F9FAFB" }],
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof QuickActionsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default View
 * Displays the panel with all quick action buttons available.
 */
export const Default: Story = {};
