// src/components/molecules/ProfileMenu.tsx

import { useState } from "react";
import { Avatar, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

interface ProfileMenuProps {
  userName: string;
}

export const ProfileMenu = ({ userName }: ProfileMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);

  // Extract the actual function from the global context
  const { logoutUser } = useAuth();

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    logoutUser(); // We clean up the function call to just logoutUser, as it's already extracted from the context
  };

  return (
    <>
      {/* Simple button (Avatar) that will replace the "Login" button */}
      <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
        {/* Show the user's initial if there's no photo */}
        <Avatar sx={{ bgcolor: "primary.main" }}>
          {userName.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary" fontWeight="bold">
            {userName}
          </Typography>
        </MenuItem>

        <MenuItem onClick={handleLogout} sx={{ color: "error.main", mt: 1 }}>
          Cerrar Sesión
        </MenuItem>
      </Menu>
    </>
  );
};
