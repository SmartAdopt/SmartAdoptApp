// src/components/organisms/PetGrid.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { PetGrid } from "./PetGrid";
import type { Pet } from "../../types/dashboard.types";
import { MemoryRouter } from "react-router-dom";
import { PetProvider } from "../../context/PetContext";

/**
 * MOCK DATA
 * Used to visualize the grid layout with realistic content.
 */
const mockPets: Pet[] = [
  {
    id: "pet-1",
    nombre: "Max",
    raza: "Labrador",
    edad: "2 años",
    genero: "Macho",
    ubicacion: "Centro SmartAdopt",
    imagen: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
  },
  {
    id: "pet-2",
    nombre: "Luna",
    raza: "Siamese",
    edad: "1 año",
    genero: "Hembra",
    ubicacion: "Centro SmartAdopt",
    imagen:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
  },
  {
    id: "pet-3",
    nombre: "Bruno",
    raza: "Bulldog",
    edad: "3 años",
    genero: "Macho",
    ubicacion: "Centro SmartAdopt",
    imagen:
      "https://images.unsplash.com/photo-1537151608804-ea6f117ce324?w=400",
  },
];

/**
 * Storybook Metadata Configuration
 * Atomic Level: Organism
 */
const meta = {
  title: "Organisms/PetGrid",
  component: PetGrid,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <PetProvider>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </PetProvider>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof PetGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default View
 * Displays the grid fully populated with pet cards.
 */
export const Default: Story = {
  args: {
    pets: mockPets,
  },
};

/**
 * Empty State
 * Verifies that the empty state design renders correctly when the 'pets' array is empty.
 */
export const Empty: Story = {
  args: {
    pets: [],
  },
};
