import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  List as ListIcon,
  BookOnline as BookingIcon,
  Star as RatingIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

// Components
import Overview from './Overview';
import MyListings from './MyListings';
import MyBookings from './MyBookings';
import ReceivedBookings from './ReceivedBookings';

const drawerWidth = 240;

const menuItems = [
  { text: 'Overview', icon: <DashboardIcon />, path: '' },
  { text: 'My Listings', icon: <ListIcon />, path: '/listings' },
  { text: 'My Bookings', icon: <BookingIcon />, path: '/bookings' },
  { text: 'Received Bookings', icon: <BookingIcon />, path: '/received-bookings' },
  { text: 'Reviews', icon: <RatingIcon />, path: '/reviews' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const currentPath = location.pathname.split('/dashboard')[1];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Dashboard
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={currentPath === item.path}
              onClick={() => {
                navigate(`/dashboard${item.path}`);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderContent = () => {
    switch (currentPath) {
      case '':
        return <Overview />;
      case '/listings':
        return <MyListings />;
      case '/bookings':
        return <MyBookings />;
      case '/received-bookings':
        return <ReceivedBookings />;
      case '/reviews':
        return <div>Reviews (Coming Soon)</div>;
      case '/settings':
        return <div>Settings (Coming Soon)</div>;
      default:
        return <Overview />;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              {menuItems.find((item) => item.path === currentPath)?.text || 'Dashboard'}
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 7, md: 0 },
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
};

export default Dashboard;
