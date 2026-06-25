import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { Box } from "@mui/material";
import { LoginForm } from "./LoginForm";

import { AuthProvider } from "../../context/AuthContext";

const meta: Meta<typeof LoginForm> = {
  title: "Organisms/LoginForm",
  component: LoginForm,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          width: "100%",
          maxWidth: 450,
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <AuthProvider>
          <Story />
        </AuthProvider>
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/login"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const WithSuccessToast: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/login",
            state: {
              successMessage: "¡Registro exitoso! Por favor inicia sesión.",
            },
          },
        ]}
      >
        <Story />
      </MemoryRouter>
    ),
  ],
};
