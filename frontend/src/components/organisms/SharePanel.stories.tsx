// src/components/organisms/SharePanel.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { SharePanel } from "./SharePanel";

/**
 * Storybook Metadata Configuration
 * Atomic Level: Organism
 */
const meta = {
  title: "Organisms/SharePanel",
  component: SharePanel,
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#F9FAFB" }],
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SharePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default View
 * Represents the panel as it appears in the sidebar or dashboard.
 */
export const Default: Story = {};
