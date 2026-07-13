/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/organisms/AdminNavbar.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { AdminNavbar } from "./AdminNavbar";
import { fn } from "@storybook/test";
import { Box } from "@mui/material";

// 1. Import the actual AuthContext from your application
import { AuthContext } from "../../context/AuthContext";

/**
 * MOCK SETUP
 * The component's internal useAuth hook relies on the application's actual AuthContext.
 * We must wrap the story with the real AuthContext.Provider and pass mock values
 * to satisfy the hook's internal validation constraints.
 */
const meta = {
  title: "Organisms/AdminNavbar",
  component: AdminNavbar,
  parameters: {
    // Fullscreen layout is required for navbars to span 100% of the viewport width
    layout: "fullscreen",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#F9FAFB" }],
    },
  },
  decorators: [
    (Story) => (
      // 2. Use the real Provider with mock actions
      <AuthContext.Provider
        value={
          {
            logoutUser: fn(),
            // Cast to any to bypass strict TS requirements for context properties
            // that are not actively used by the AdminNavbar component
          } as any
        }
      >
        <Box
          sx={{ width: "100%", height: "100vh", bgcolor: "background.default" }}
        >
          <Story />
        </Box>
      </AuthContext.Provider>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof AdminNavbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default Desktop View
 * Displays the full navbar with the welcome chip and action buttons visible.
 */
export const Desktop: Story = {};

/**
 * Mobile View
 * Validates responsive design by ensuring the welcome chip is hidden gracefully
 * on smaller viewports to prevent layout overflow.
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
