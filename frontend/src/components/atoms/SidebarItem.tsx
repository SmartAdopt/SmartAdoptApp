// src/components/atoms/SidebarItem.tsx
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { type ReactNode } from "react";

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  selected?: boolean;
  onClick: () => void;
}

export const SidebarItem = ({ icon, label, selected = false, onClick }: SidebarItemProps) => {
  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        selected={selected}
        onClick={onClick}
        sx={{
          borderRadius: 2,
          "&.Mui-selected": {
            bgcolor: "primary.light",
            color: "primary.main",
            "&:hover": { bgcolor: "primary.light" },
          },
        }}
      >
        <ListItemIcon
          sx={{
            color: selected ? "primary.main" : "text.secondary",
            minWidth: 40,
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText 
          primary={label} 
          primaryTypographyProps={{ 
            fontWeight: selected ? 600 : 400 
          }} 
        />
      </ListItemButton>
    </ListItem>
  );
};