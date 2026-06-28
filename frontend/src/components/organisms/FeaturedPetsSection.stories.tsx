// src/components/organisms/FeaturedPetsSection.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { FeaturedPetsSection } from "./FeaturedPetsSection";
import { petsService } from "../../services/pets.service";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

// Import your application's Provider
import { PetProvider } from "../../context/PetContext";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta = {
  title: "Organisms/FeaturedPetsSection",
  component: FeaturedPetsSection,
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#F9FAFB" }],
    },
  },
  decorators: [
    (Story, context) => {
      // Mock the service method
      petsService.getRawPetsDatabase = async () => {
        return context.parameters.mockData ?? [];
      };

      return (
        <QueryClientProvider client={queryClient}>
          {/* FIX: Wrap with PetProvider to provide the required context for usePetDatabase */}
          <PetProvider>
            <MemoryRouter>
              <Story />
            </MemoryRouter>
          </PetProvider>
        </QueryClientProvider>
      );
    },
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof FeaturedPetsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
