import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { Box } from "@mui/material";
import { PetGrid } from "./PetGrid";
import type { Pet } from "../../types/dashboard.types";

// ==========================================
// CONTEXT PROVIDERS
// ==========================================
// Import the PetProvider to resolve the "usePetDatabase must be used within a PetProvider" error.
// Adjust this path if your directory structure is different.
import { PetProvider } from "../../context/PetContext";

// ==========================================
// MOCK DATA
// ==========================================
// Realistic mock data to test how the Material UI responsive grid behaves with multiple cards.
const mockPets: Pet[] = [
  {
    id: "1",
    nombre: "Max",
    raza: "Golden Retriever",
    edad: "2 años",
    genero: "Macho",
    ubicacion: "Quito Centro",
    imagen:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "2",
    nombre: "Luna",
    raza: "Mestizo",
    edad: "6 meses",
    genero: "Hembra",
    ubicacion: "Cumbayá",
    imagen:
      "https://images.unsplash.com/photo-1537151608804-ea2f1ea14a15?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "3",
    nombre: "Rocky",
    raza: "Pastor Alemán",
    edad: "4 años",
    genero: "Macho",
    ubicacion: "Valle de los Chillos",
    imagen:
      "https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "4",
    nombre: "Bella",
    raza: "Bulldog Francés",
    edad: "1 año",
    genero: "Hembra",
    ubicacion: "Quito Norte",
    imagen:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=500&q=80",
  },
];

// ==========================================
// STORYBOOK META CONFIGURATION
// ==========================================
const meta: Meta<typeof PetGrid> = {
  title: "Organisms/PetGrid",
  component: PetGrid,
  parameters: {
    // We use 'padded' layout instead of 'centered' because responsive grids require width to adapt.
    layout: "padded",
  },
  decorators: [
    (Story) => (
      // Simulate a generic container for the main layout to test grid constraints.
      <Box
        sx={{
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
          p: 2,
          bgcolor: "background.default",
        }}
      >
        {/* Wrap the Story in both the PetProvider and MemoryRouter to supply missing contexts */}
        <PetProvider>
          <MemoryRouter>
            <Story />
          </MemoryRouter>
        </PetProvider>
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PetGrid>;

// ---------------------------------------------------------------------------
// STORIES (Visual States)
// ---------------------------------------------------------------------------

/**
 * Populated State:
 * Renders the grid populated with multiple pet cards.
 * Resize the Storybook viewport to see the MUI Grid transition from 1 column (mobile)
 * to 2 columns (tablet) and 3 columns (desktop).
 */
export const Populated: Story = {
  args: {
    pets: mockPets,
  },
};

/**
 * Empty State:
 * Simulates a scenario where the search filters return no results.
 * Validates the rendering of the empty state UI and UX copy.
 */
export const EmptyState: Story = {
  args: {
    pets: [],
  },
};
