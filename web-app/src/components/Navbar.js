import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';
import ProfileMenu from './ProfileMenu';
import Logo from './Logo';

const pages = [
  { title: 'Home', path: '/' },
  { title: 'Browse', path: '/browse' },
  { title: 'How It Works', path: '/how-it-works' },
  { title: 'Become a Lender', path: '/become-a-lender' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorElNav, setAnchorElNav] = useState(null);
  const { user } = useAuth();

  const handleOpenNavMenu = (event) => {
    if (isMobileView) {
      setAnchorElNav(event.currentTarget);
    }
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleCloseNavMenu();
  };

  return (
    <AppBar 
      position="static" 
      elevation={1}
      sx={{
        backgroundColor: '#F5F0E8', // Beige color matching your logo
        color: '#3E2723', // Dark brown for text
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo for desktop */}
          <Box
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center'
            }}
          >
            <Logo size="small" onClick={() => navigate('/')} />
          </Box>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
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
                <MenuItem
                  key={page.title}
                  onClick={() => handleNavigate(page.path)}
                  selected={location.pathname === page.path}
                >
                  <Typography textAlign="center">{page.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Logo for mobile */}
          <Box
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              alignItems: 'center'
            }}
          >
            <Logo size="small" onClick={() => navigate('/')} />
          </Box>

          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.title}
                onClick={() => handleNavigate(page.path)}
                sx={{
                  my: 2,
                  mx: 1,
                  color: '#3E2723',
                  display: 'block',
                  fontWeight: location.pathname === page.path ? 700 : 500,
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(62, 39, 35, 0.04)',
                    transform: 'translateY(-2px)',
                    '&::after': {
                      width: '100%',
                      left: '0'
                    }
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '5px',
                    right: '0',
                    width: '0',
                    height: '2px',
                    backgroundColor: '#3E2723',
                    transition: 'width 0.3s ease, left 0.3s ease'
                  }
                }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          {/* Auth buttons or Profile menu */}
          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <ProfileMenu />
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: '#3E2723',
                    borderColor: '#3E2723',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#3E2723',
                      backgroundColor: 'rgba(62, 39, 35, 0.04)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(62, 39, 35, 0.1)'
                    }
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/signup"
                  sx={{
                    backgroundColor: '#3E2723',
                    color: '#F5F0E8',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#2D1B18',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(62, 39, 35, 0.2)'
                    }
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
