import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { Box } from "@mui/material";
import { RegisterForm } from "./RegisterForm";

import { AuthProvider } from "../../context/AuthContext";

const meta: Meta<typeof RegisterForm> = {
  title: "Organisms/RegisterForm",
  component: RegisterForm,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          width: "100%",
          maxWidth: 500,
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <MemoryRouter initialEntries={["/register"]}>
          <AuthProvider>
            <Story />
          </AuthProvider>
        </MemoryRouter>
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RegisterForm>;

export const Default: Story = {};
