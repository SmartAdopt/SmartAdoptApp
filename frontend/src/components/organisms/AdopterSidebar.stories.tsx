/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/organisms/AdopterSidebar.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { AdopterSidebar } from "./AdopterSidebar";
import { fn } from "@storybook/test";
import { MemoryRouter } from "react-router-dom";
import { Box } from "@mui/material";

// Import the actual AuthContext from the application to satisfy the useAuth hook
import { AuthContext } from "../../context/AuthContext";

/**
 * Storybook Metadata Configuration
 * Atomic Level: Organism
 */
const meta = {
  title: "Organisms/AdopterSidebar",
  component: AdopterSidebar,
  parameters: {
    // Fullscreen layout allows the sidebar to snap to the left edge of the viewport
    layout: "fullscreen",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#F9FAFB" }],
    },
  },
  decorators: [
    (Story) => (
      // Wrap with MemoryRouter to satisfy react-router-dom hooks (useLocation, useNavigate)
      <MemoryRouter initialEntries={["/adopter/dashboard"]}>
        {/* Wrap with the REAL AuthContext to prevent the "useAuth" throw error */}
        <AuthContext.Provider
          value={
            {
              logoutUser: fn(),
              // Cast to any to bypass strict TS requirements for context properties
              // that are not actively used by the AdopterSidebar component
            } as any
          }
        >
          <Box
            sx={{
              display: "flex",
              height: "100vh",
              bgcolor: "background.default",
            }}
          >
            <Story />
          </Box>
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof AdopterSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default View
 * Displays the sidebar with the "Inicio" (Dashboard) item active based on the mocked routing.
 */
export const Default: Story = {};
