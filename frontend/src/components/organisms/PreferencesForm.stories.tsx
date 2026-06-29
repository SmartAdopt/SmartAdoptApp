// src/components/organisms/PreferencesForm.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { PreferencesForm } from "./PreferencesForm";
import { MemoryRouter } from "react-router-dom";

/**
 * Storybook Metadata Configuration
 * Atomic Level: Organism
 * This organism orchestrates the adopter's preference configuration,
 * providing the necessary state management and routing for the setup flow.
 */
const meta = {
  title: "Organisms/PreferencesForm",
  component: PreferencesForm,
  parameters: {
    // Padded layout provides a clear boundary for form-based organisms
    layout: "padded",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#F9FAFB" }],
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof PreferencesForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default View
 * Represents the configuration form.
 * Note: Submitting this form will attempt to navigate the Storybook router,
 * which is expected behavior for an organism in this state.
 */
export const Default: Story = {};
