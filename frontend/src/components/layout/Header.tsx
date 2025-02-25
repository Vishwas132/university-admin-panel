import React from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  ChevronRight as ChevronRightIcon, 
  AccountCircle,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/dashboard/profile');
    handleClose();
  };

  return (
    <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'background.paper' }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label={isSidebarOpen ? "collapse sidebar" : "expand sidebar"}
          onClick={onMenuClick}
          sx={{ mr: 2, color: 'text.primary' }}
        >
          {isSidebarOpen ? <MenuIcon /> : <ChevronRightIcon />}
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
          College Admin Panel
        </Typography>

        <Button
          color="primary"
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          sx={{ mr: 2 }}
        >
          Logout
        </Button>

        <Box>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            {user?.profilePicture ? (
              <Avatar src={user.profilePicture} alt={user.name} />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleProfile}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 