// src/components/organisms/LeftAuthSidebar.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { LeftAuthSidebar } from "./LeftAuthSidebar";
import { Box } from "@mui/material";

/**
 * Storybook Metadata Configuration
 * Atomic Level: Organism
 * This component acts as a structural organism for authentication flows,
 * housing the brand identity and value proposition cards.
 */
const meta = {
  title: "Organisms/LeftAuthSidebar",
  component: LeftAuthSidebar,
  parameters: {
    // Layout: 'fullscreen' allows us to define the width constraints in the decorator
    layout: "fullscreen",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#FFFFFF" }],
    },
  },
  decorators: [
    (Story) => (
      // We wrap the story in a container to simulate the sidebar's position
      // and ensure it fills the viewport height as expected in the app layout.
      <Box
        sx={{
          height: "100vh",
          width: "350px",
          borderRight: "1px solid #e0e0e0",
          px: 2,
        }}
      >
        <Story />
      </Box>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof LeftAuthSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default View
 * Represents the standard desktop sidebar state.
 */
export const Default: Story = {};
