// src/components/molecules/ProfileMenu.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, IconButton, Menu, MenuItem, Typography } from "@mui/material";

// TODO: When integrating the backend, import your useAuth hook here
// import { useAuth } from "../../context/AuthProvider";

interface ProfileMenuProps {
  userName: string;
}

export const ProfileMenu = ({ userName }: ProfileMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);
  const navigate = useNavigate();

  // const { logout } = useAuth(); // Future integration

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    /* ENTERPRISE BEST PRACTICE:
      Ideally, call your context logout here: logout();
      For now, we manually clean up to act as a solid mold.
    */
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    sessionStorage.clear();

    // Redirect to Login clearing the history stack
    navigate("/login", { replace: true });
  };

  return (
    <>
      <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
        <Avatar alt={userName} src="/react.svg" />
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

        <MenuItem onClick={handleCloseMenu}>Mi Perfil</MenuItem>

        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          Cerrar Sesión
        </MenuItem>
      </Menu>
    </>
  );
};
