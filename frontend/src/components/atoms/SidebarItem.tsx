// src/components/atoms/SidebarItem.tsx

import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
  onClick: () => void;
}

export const SidebarItem = ({
  icon,
  label,
  selected = false,
  onClick,
}: SidebarItemProps) => {
  return (
    <ListItemButton
      selected={selected}
      onClick={onClick}
      sx={{
        borderRadius: 2,
        mb: 1,

        "&.Mui-selected": {
          backgroundColor: "#E8F5E9",
          color: "#2E7D32",
        },

        "&.Mui-selected:hover": {
          backgroundColor: "#DDF3E1",
        },
      }}
    >
      <ListItemIcon
        sx={{
          color: selected ? "#2E7D32" : "inherit",
          minWidth: 40,
        }}
      >
        {icon}
      </ListItemIcon>

      <ListItemText primary={label} />
    </ListItemButton>
  );
};