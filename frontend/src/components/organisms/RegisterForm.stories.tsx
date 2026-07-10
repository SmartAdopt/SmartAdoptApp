/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/organisms/RegisterForm.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { RegisterForm } from "./RegisterForm";
import { authService } from "../../services/auth.service";
import { fn } from "@storybook/test";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

/**
 * Storybook Metadata Configuration
 * Atomic Level: Organism
 * This organism orchestrates the user registration flow, handling form validation
 * and API interactions.
 */
const meta = {
  title: "Organisms/RegisterForm",
  component: RegisterForm,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#F9FAFB" }],
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthContext.Provider
          value={
            {
              isAuthenticated: false,
              role: "adopter",
              user: null,
              loginUser: fn(),
              logoutUser: fn(),
            } as any
          }
        >
          <Story />
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof RegisterForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default View
 * Represents the initial state of the registration form.
 */
export const Default: Story = {};

/**
 * Loading State
 * Visual check for the button loading indicator while awaiting API response.
 */
export const Loading: Story = {
  // To test this reliably, you would ideally expose an 'isLoading' prop
  // or mock the service to have a long latency.
};

/**
 * Registration Error
 * Demonstrates the UI response when the registration service fails (e.g., email already exists).
 */
export const RegisterError: Story = {
  decorators: [
    (Story) => {
      // Mock the service to reject with a specific error
      authService.register = fn().mockRejectedValue(
        new Error("El correo electrónico ya está registrado."),
      );
      return <Story />;
    },
  ],
};
