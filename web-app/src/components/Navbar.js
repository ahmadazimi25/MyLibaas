import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Divider,
} from '@mui/material';
import { Menu as MenuIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import CreateListing from './CreateListing';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [createListingOpen, setCreateListingOpen] = useState(false);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    handleCloseNavMenu();
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/');
  };

  const pages = [
    { name: 'Browse', path: '/browse' },
    { name: 'How It Works', path: '/how-it-works' },
  ];

  return (
    <>
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Desktop Logo */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 4 }}>
              <Logo size="medium" />
            </Box>

            {/* Mobile Menu */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page.name} onClick={() => handleMenuClick(page.path)}>
                    <Typography textAlign="center">{page.name}</Typography>
                  </MenuItem>
                ))}
                {user && (
                  <MenuItem onClick={() => setCreateListingOpen(true)}>
                    <Typography textAlign="center">Create Listing</Typography>
                  </MenuItem>
                )}
              </Menu>
            </Box>

            {/* Mobile Logo */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, justifyContent: 'center' }}>
              <Logo size="small" />
            </Box>

            {/* Desktop Menu Items */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              {pages.map((page) => (
                <Button
                  key={page.name}
                  onClick={() => handleMenuClick(page.path)}
                  sx={{ color: 'text.primary', display: 'block' }}
                >
                  {page.name}
                </Button>
              ))}
              {user && (
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => setCreateListingOpen(true)}
                  sx={{ ml: 2 }}
                >
                  Create Listing
                </Button>
              )}
            </Box>

            {/* User Menu */}
            <Box sx={{ flexGrow: 0 }}>
              {user ? (
                <>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar alt={user.name} src="/static/images/avatar/2.jpg" />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem onClick={() => handleMenuClick('/dashboard')}>
                      <Typography textAlign="center">Dashboard</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => handleMenuClick('/profile')}>
                      <Typography textAlign="center">Profile</Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/login')}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/signup')}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Sign Up
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Create Listing Dialog */}
      <CreateListing
        open={createListingOpen}
        onClose={() => setCreateListingOpen(false)}
      />
    </>
  );
};

export default Navbar;
