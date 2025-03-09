import React, { useState, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Tooltip from '@mui/material/Tooltip';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import HelpIcon from '@mui/icons-material/Help';

// Auth context
import { AuthContext } from '../context/AuthContext';

// Notifications menu component
import NotificationsMenu from '../components/Notifications/NotificationsMenu';

const drawerWidth = 260;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  borderRight: '0px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.palette.mode === 'light' 
    ? '0px 2px 4px rgba(0, 0, 0, 0.03), 0px 4px 8px rgba(0, 0, 0, 0.05)'
    : '0px 2px 4px rgba(0, 0, 0, 0.2), 0px 4px 8px rgba(0, 0, 0, 0.3)',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: theme.spacing(7),
  [theme.breakpoints.up('sm')]: {
    width: theme.spacing(9),
  },
  borderRight: '0px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.palette.mode === 'light' 
    ? '0px 2px 4px rgba(0, 0, 0, 0.03), 0px 4px 8px rgba(0, 0, 0, 0.05)'
    : '0px 2px 4px rgba(0, 0, 0, 0.2), 0px 4px 8px rgba(0, 0, 0, 0.3)',
});

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  boxShadow: 'none',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const pageToIcon = {
  dashboard: DashboardIcon,
  orders: ShoppingCartIcon,
  inventory: InventoryIcon,
  shipments: LocalShippingIcon,
  customers: PeopleIcon,
  suppliers: BusinessIcon,
  reports: BarChartIcon,
  settings: SettingsIcon,
};

const mainListItems = [
  { id: 'dashboard', text: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
  { id: 'orders', text: 'Orders', path: '/orders', icon: ShoppingCartIcon },
  { id: 'inventory', text: 'Inventory', path: '/inventory', icon: InventoryIcon },
  { id: 'shipments', text: 'Shipments', path: '/shipments', icon: LocalShippingIcon },
];

const secondaryListItems = [
  { id: 'customers', text: 'Customers', path: '/customers', icon: PeopleIcon },
  { id: 'suppliers', text: 'Suppliers', path: '/suppliers', icon: BusinessIcon },
  { id: 'reports', text: 'Reports', path: '/reports', icon: BarChartIcon },
  { id: 'settings', text: 'Settings', path: '/settings', icon: SettingsIcon },
];

function DashboardLayout({ toggleTheme, themeMode }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  
  const [open, setOpen] = useState(true);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [themeMenuAnchorEl, setThemeMenuAnchorEl] = useState(null);
  
  // Get current page based on path
  const getCurrentPage = () => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    return path;
  };
  
  const currentPage = getCurrentPage();
  
  // Generate page title based on current page
  const getPageTitle = () => {
    const page = getCurrentPage();
    return page.charAt(0).toUpperCase() + page.slice(1);
  };
  
  // Handle drawer open/close
  const toggleDrawer = () => {
    setOpen(!open);
  };
  
  // Handle user menu
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };
  
  // Handle notifications menu
  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };
  
  // Handle theme menu
  const handleThemeMenuOpen = (event) => {
    setThemeMenuAnchorEl(event.currentTarget);
  };
  
  const handleThemeMenuClose = () => {
    setThemeMenuAnchorEl(null);
  };
  
  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{
              marginRight: 2,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            {getPageTitle()}
          </Typography>
          
          {/* Theme toggle */}
          <Tooltip title="Theme settings">
            <IconButton color="inherit" onClick={handleThemeMenuOpen}>
              {themeMode === 'light' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={themeMenuAnchorEl}
            open={Boolean(themeMenuAnchorEl)}
            onClose={handleThemeMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { toggleTheme(); handleThemeMenuClose(); }}>
              <ListItemIcon>
                {themeMode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
              </ListItemIcon>
              <ListItemText>
                {themeMode === 'light' ? 'Dark Mode' : 'Light Mode'}
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={handleThemeMenuClose}>
              <ListItemIcon>
                <BrightnessAutoIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Auto</ListItemText>
            </MenuItem>
          </Menu>
          
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationsOpen}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <NotificationsMenu
            anchorEl={notificationsAnchorEl}
            open={Boolean(notificationsAnchorEl)}
            onClose={handleNotificationsClose}
          />
          
          {/* User menu */}
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleUserMenuOpen}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={Boolean(userMenuAnchorEl) ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(userMenuAnchorEl) ? 'true' : undefined}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={userMenuAnchorEl}
            id="account-menu"
            open={Boolean(userMenuAnchorEl)}
            onClose={handleUserMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { handleNavigation('/settings/profile'); handleUserMenuClose(); }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => { handleNavigation('/settings'); handleUserMenuClose(); }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { handleLogout(); handleUserMenuClose(); }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: [1],
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <LocalShippingIcon 
              color="primary" 
              sx={{ mr: 1, transform: 'scale(1.2)' }} 
            />
            <Typography
              variant="h6"
              color="primary"
              fontWeight="700"
              noWrap
            >
              LogiTrack
            </Typography>
          </Box>
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List component="nav">
          {/* Main list items */}
          {mainListItems.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                backgroundColor: currentPage === item.id ? 
                  theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(144, 202, 249, 0.08)' 
                  : 'transparent',
                borderLeft: currentPage === item.id ? 
                  `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'light' ? 
                    'rgba(25, 118, 210, 0.04)' : 'rgba(144, 202, 249, 0.04)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: currentPage === item.id ? theme.palette.primary.main : 'inherit',
                }}
              >
                <item.icon />
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  opacity: open ? 1 : 0,
                  color: currentPage === item.id ? theme.palette.primary.main : 'inherit',
                  '& .MuiTypography-root': {
                    fontWeight: currentPage === item.id ? 600 : 400,
                  },
                }} 
              />
            </ListItemButton>
          ))}
          
          <Divider sx={{ my: 1 }} />
          
          {/* Secondary list items */}
          {secondaryListItems.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                backgroundColor: currentPage === item.id ? 
                  theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(144, 202, 249, 0.08)' 
                  : 'transparent',
                borderLeft: currentPage === item.id ? 
                  `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'light' ? 
                    'rgba(25, 118, 210, 0.04)' : 'rgba(144, 202, 249, 0.04)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: currentPage === item.id ? theme.palette.primary.main : 'inherit',
                }}
              >
                <item.icon />
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  opacity: open ? 1 : 0,
                  color: currentPage === item.id ? theme.palette.primary.main : 'inherit',
                  '& .MuiTypography-root': {
                    fontWeight: currentPage === item.id ? 600 : 400,
                  },
                }} 
              />
            </ListItemButton>
          ))}
          
          <Divider sx={{ my: 1 }} />
          
          {/* Help item */}
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              mt: 'auto',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary="Help & Support" sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.background.default
              : theme.palette.background.default,
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default DashboardLayout;