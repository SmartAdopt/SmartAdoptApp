/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Meta, StoryObj } from "@storybook/react";
import { Navbar } from "./Navbar";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { fn } from "@storybook/test";

const meta = {
  title: "Organisms/Navbar",
  component: Navbar,
  parameters: {
    layout: "fullscreen",
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
              logoutUser: fn(),
              loginUser: fn(),
            } as any
          }
        >
          <Story />
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Authenticated: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthContext.Provider
          value={
            {
              isAuthenticated: true,
              role: "adopter",
              user: { name: "Usuario Prueba" },
              logoutUser: fn(),
              loginUser: fn(),
            } as any
          }
        >
          <Story />
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  ],
};
