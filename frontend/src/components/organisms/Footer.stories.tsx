/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/organisms/Footer.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { Footer } from "./Footer";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { fn } from "@storybook/test";

/**
 * Storybook Metadata Configuration
 * Atomic Level: Organisms
 */
const meta = {
  title: "Organisms/Footer",
  component: Footer,
  parameters: {
    // Footer spans the entire viewport width
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        {/* Providing mock authentication context to handle conditional logic */}
        <AuthContext.Provider
          value={
            {
              isAuthenticated: false,
              logoutUser: fn(),
              // Mocking other required context properties
            } as any
          }
        >
          <Story />
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default Desktop View
 */
export const Desktop: Story = {};

/**
 * Mobile View
 * Verifies responsive stacking of grid columns.
 */
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};

/**
 * Authenticated State
 * Verifies the component state when a user is logged in.
 */
export const Authenticated: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthContext.Provider
          value={
            {
              isAuthenticated: true,
              logoutUser: fn(),
            } as any
          }
        >
          <Story />
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  ],
};
