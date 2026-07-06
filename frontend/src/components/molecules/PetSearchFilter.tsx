// src/components/molecules/PetSearchFilter.tsx

import React, { useEffect } from "react";
import { TextField, InputAdornment, Box } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Zod Schema to validate search query bounds safely
const searchSchema = z.object({
  queryText: z.string().max(50, "Búsqueda demasiado larga").optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface PetSearchFilterProps {
  onSearchChange: (value: string) => void;
}

export const PetSearchFilter: React.FC<PetSearchFilterProps> = ({
  onSearchChange,
}) => {
  const { control } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: { queryText: "" },
  });

  const observedQuery = useWatch({ control, name: "queryText" });

  // Push updates to parent page component reactively as the user types
  useEffect(() => {
    onSearchChange(observedQuery || "");
  }, [observedQuery, onSearchChange]);

  return (
    <Box
      component="form"
      sx={{ width: "100%", mb: 4 }}
      onSubmit={(e) => e.preventDefault()}
    >
      <Controller
        name="queryText"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            variant="outlined"
            placeholder="Buscar por nombre, raza o ubicación..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "grey.200",
                "& fieldset": { border: "none" },
              },
            }}
          />
        )}
      />
    </Box>
  );
};
