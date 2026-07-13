/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/organisms/LoginForm.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { LoginForm } from "./LoginForm";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { fn } from "@storybook/test";

/**
 * Storybook Metadata Configuration
 * Atomic Level: Organism
 */
const meta = {
  title: "Organisms/LoginForm",
  component: LoginForm,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthContext.Provider
          value={
            {
              isAuthenticated: false,
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
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default View
 * The primary state of the login form.
 */
export const Default: Story = {};

/**
 * Loading State
 * Visual check for the button loading indicator.
 */
export const Loading: Story = {
  // You would need to expose the loading state via props if you want to test this
  // via stories, otherwise this visual state is hard to trigger in pure isolation.
};

/**
 * Error State
 * Visual check for the error alert appearance.
 */
export const LoginError: Story = {
  // You could mock the service implementation here to force an error trigger
};
