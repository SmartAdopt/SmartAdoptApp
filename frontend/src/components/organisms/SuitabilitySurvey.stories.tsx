import type { Meta, StoryObj } from "@storybook/react";
import { SuitabilitySurvey } from "./SuitabilitySurvey";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import type { SuitabilitySurveyData } from "../../types/suitability.types";

// Note: If you have a custom theme defined in your project, import and use it here
// instead of creating a default one.
const defaultTheme = createTheme();

const meta: Meta<typeof SuitabilitySurvey> = {
  title: "Organisms/SuitabilitySurvey",
  component: SuitabilitySurvey,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Multi-step adoption application form for the SmartAdopt platform. Captures sociodemographic, housing, and motivational data using React Hook Form and Zod validation.",
      },
    },
  },
  // We wrap the component in a ThemeProvider and a constrained Box to simulate a realistic layout
  decorators: [
    (Story) => (
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Box sx={{ width: "100%", maxWidth: 800, margin: "0 auto", p: 2 }}>
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    onSubmit: {
      action: "Form Submitted",
      description:
        "Callback fired when the user successfully completes and submits the last step of the survey.",
    },
    onCancel: {
      action: "Form Cancelled",
      description:
        "Optional callback fired when the user clicks the cancel button.",
    },
    initialData: {
      description: "Optional pre-populated data for the form.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof SuitabilitySurvey>;

/**
 * Default state of the SuitabilitySurvey form.
 * Begins at Step 1 with empty fields based on `initialSurveyData`.
 */
export const Default: Story = {};

/**
 * Story demonstrating the form with the Cancel button enabled.
 */
export const WithCancelAction: Story = {
  args: {
    onCancel: () => console.log("Cancel action triggered from Storybook"),
  },
};

/**
 * Mock data to simulate an in-progress or pre-filled application.
 */
const mockPreFilledData: Partial<SuitabilitySurveyData> = {
  cityNeighborhood: "Quito, La Floresta",
  address: "Av. Coruña y Valladolid",
  employmentStatus: "Empleado",
  housingType: "Departamento",
  hasNaturalSpace: "Sí",
  // Note: Remaining fields are left undefined to simulate an incomplete form
  // or to rely on the default values defined in `initialSurveyData`.
};

/**
 * Story demonstrating the form initialized with pre-existing data.
 * Useful for scenarios where a user returns to a saved draft.
 */
export const WithInitialData: Story = {
  args: {
    initialData: mockPreFilledData as SuitabilitySurveyData,
    onCancel: () => console.log("Cancel action triggered"),
  },
};
