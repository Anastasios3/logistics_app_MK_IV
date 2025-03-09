import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';

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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import WarningIcon from '@mui/icons-material/Warning';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Sample data for demonstration purposes
const sampleData = {
  totalOrders: 1248,
  totalRevenue: 287650,
  totalShipments: 876,
  inventoryCount: 1532,
  ordersTrend: 18.2, // percentage increase
  revenueTrend: 12.5, // percentage increase
  shipmentsTrend: -2.4, // percentage decrease
  inventoryTrend: 5.3, // percentage increase
  recentOrders: [
    { id: 'ORD-2023-05-12', customer: 'Acme Corporation', amount: 2500, status: 'delivered', date: '2023-05-12' },
    { id: 'ORD-2023-05-11', customer: 'TechGiant Inc.', amount: 3600, status: 'shipped', date: '2023-05-11' },
    { id: 'ORD-2023-05-11', customer: 'Globex Corp', amount: 1800, status: 'processing', date: '2023-05-11' },
    { id: 'ORD-2023-05-10', customer: 'Wayne Enterprises', amount: 4200, status: 'pending', date: '2023-05-10' },
    { id: 'ORD-2023-05-09', customer: 'Stark Industries', amount: 2900, status: 'delivered', date: '2023-05-09' },
  ],
  pendingShipments: [
    { id: 'SHP-2023-05-12', destination: 'Chicago, IL', items: 12, status: 'in_transit' },
    { id: 'SHP-2023-05-11', destination: 'Los Angeles, CA', items: 8, status: 'pending' },
    { id: 'SHP-2023-05-10', destination: 'New York, NY', items: 15, status: 'pending' },
    { id: 'SHP-2023-05-09', destination: 'Miami, FL', items: 6, status: 'in_transit' },
  ],
  lowStockItems: [
    { id: 'PRD-001', name: 'Wireless Earbuds', stock: 5, reorderLevel: 10 },
    { id: 'PRD-015', name: 'USB-C Cable', stock: 8, reorderLevel: 20 },
    { id: 'PRD-032', name: 'Power Bank', stock: 3, reorderLevel: 15 },
    { id: 'PRD-048', name: 'Bluetooth Speaker', stock: 6, reorderLevel: 12 },
  ],
};

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

function Dashboard() {
  const theme = useTheme();
  
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  
  useEffect(() => {
    // Simulate API call to fetch data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
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
  
  // Handler for opening more menu
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  // Handler for closing more menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Get order status chip color
  const getOrderStatusChipColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'primary';
      case 'processing':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // Get trend icon and color
  const getTrendIcon = (trend) => {
    if (trend > 0) {
      return (
        <Box display="flex" alignItems="center" color="success.main">
          <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2" component="span">
            {`${Math.abs(trend).toFixed(1)}%`}
          </Typography>
        </Box>
      );
    } else if (trend < 0) {
      return (
        <Box display="flex" alignItems="center" color="error.main">
          <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2" component="span">
            {`${Math.abs(trend).toFixed(1)}%`}
          </Typography>
        </Box>
      );
    } else {
      return (
        <Typography variant="body2" component="span" color="text.secondary">
          0%
        </Typography>
      );
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
            Dashboard
          </Typography>
          
          {/* Theme toggle */}
          <IconButton color="inherit">
            <LightModeIcon />
          </IconButton>
          
          {/* Notifications */}
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          {/* User menu */}
          <IconButton
            onClick={handleUserMenuOpen}
            size="small"
            sx={{ ml: 2 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
              A
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={userMenuAnchorEl}
            id="account-menu"
            open={Boolean(userMenuAnchorEl)}
            onClose={handleUserMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleUserMenuClose}>
              <ListItemAvatar>
                <PersonIcon fontSize="small" />
              </ListItemAvatar>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleUserMenuClose}>
              <ListItemAvatar>
                <SettingsIcon fontSize="small" />
              </ListItemAvatar>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleUserMenuClose}>
              <ListItemAvatar>
                <LogoutIcon fontSize="small" />
              </ListItemAvatar>
              <ListItemText>Logout</ListItemText>
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
            <ListItem
              key={item.id}
              button
              selected={item.id === 'dashboard'}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                backgroundColor: item.id === 'dashboard' ? 
                  theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(144, 202, 249, 0.08)' 
                  : 'transparent',
                borderLeft: item.id === 'dashboard' ? 
                  `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
              }}
            >
              <ListItemAvatar
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: item.id === 'dashboard' ? theme.palette.primary.main : 'inherit',
                }}
              >
                <item.icon />
              </ListItemAvatar>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  opacity: open ? 1 : 0,
                  color: item.id === 'dashboard' ? theme.palette.primary.main : 'inherit',
                  '& .MuiTypography-root': {
                    fontWeight: item.id === 'dashboard' ? 600 : 400,
                  },
                }} 
              />
            </ListItem>
          ))}
          
          <Divider sx={{ my: 1 }} />
          
          {/* Secondary list items */}
          {secondaryListItems.map((item) => (
            <ListItem
              key={item.id}
              button
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemAvatar
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <item.icon />
              </ListItemAvatar>
              <ListItemText 
                primary={item.text} 
                sx={{ opacity: open ? 1 : 0 }} 
              />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          backgroundColor: theme.palette.background.default,
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {/* Key metrics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Total Orders */}
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: '100%', 
                  position: 'relative',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[6],
                  }
                }}
              >
                {loading && (
                  <LinearProgress 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      borderTopLeftRadius: (theme) => theme.shape.borderRadius,
                      borderTopRightRadius: (theme) => theme.shape.borderRadius,
                    }} 
                  />
                )}
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar
                        sx={{
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          width: 48,
                          height: 48,
                        }}
                      >
                        <ShoppingCartIcon />
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h6" component="div">
                        {loading ? '...' : sampleData.totalOrders.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Orders
                      </Typography>
                    </Grid>
                    <Grid item>
                      {loading ? '' : getTrendIcon(sampleData.ordersTrend)}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Total Revenue */}
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: '100%', 
                  position: 'relative',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[6],
                  }
                }}
              >
                {loading && (
                  <LinearProgress 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      borderTopLeftRadius: (theme) => theme.shape.borderRadius,
                      borderTopRightRadius: (theme) => theme.shape.borderRadius,
                    }} 
                  />
                )}
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar
                        sx={{
                          backgroundColor: alpha(theme.palette.success.main, 0.1),
                          color: theme.palette.success.main,
                          width: 48,
                          height: 48,
                        }}
                      >
                        <AttachMoneyIcon />
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h6" component="div">
                        {loading ? '...' : formatCurrency(sampleData.totalRevenue)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Revenue
                      </Typography>
                    </Grid>
                    <Grid item>
                      {loading ? '' : getTrendIcon(sampleData.revenueTrend)}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Total Shipments */}
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: '100%', 
                  position: 'relative',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[6],
                  }
                }}
              >
                {loading && (
                  <LinearProgress 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      borderTopLeftRadius: (theme) => theme.shape.borderRadius,
                      borderTopRightRadius: (theme) => theme.shape.borderRadius,
                    }} 
                  />
                )}
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar
                        sx={{
                          backgroundColor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main,
                          width: 48,
                          height: 48,
                        }}
                      >
                        <LocalShippingIcon />
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h6" component="div">
                        {loading ? '...' : sampleData.totalShipments.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Shipments
                      </Typography>
                    </Grid>
                    <Grid item>
                      {loading ? '' : getTrendIcon(sampleData.shipmentsTrend)}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Inventory Count */}
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: '100%', 
                  position: 'relative',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[6],
                  }
                }}
              >
                {loading && (
                  <LinearProgress 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      borderTopLeftRadius: (theme) => theme.shape.borderRadius,
                      borderTopRightRadius: (theme) => theme.shape.borderRadius,
                    }} 
                  />
                )}
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar
                        sx={{
                          backgroundColor: alpha(theme.palette.warning.main, 0.1),
                          color: theme.palette.warning.main,
                          width: 48,
                          height: 48,
                        }}
                      >
                        <InventoryIcon />
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h6" component="div">
                        {loading ? '...' : sampleData.inventoryCount.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Inventory Items
                      </Typography>
                    </Grid>
                    <Grid item>
                      {loading ? '' : getTrendIcon(sampleData.inventoryTrend)}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Recent Orders */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ position: 'relative' }}>
                {loading && (
                  <LinearProgress 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      borderTopLeftRadius: (theme) => theme.shape.borderRadius,
                      borderTopRightRadius: (theme) => theme.shape.borderRadius,
                    }} 
                  />
                )}
                <CardHeader
                  title="Recent Orders"
                  titleTypographyProps={{ variant: 'h6' }}
                  action={
                    <Button
                      variant="text"
                      color="primary"
                      endIcon={<ArrowForwardIcon />}
                      size="small"
                    >
                      View All
                    </Button>
                  }
                />
                <Divider />
                <CardContent sx={{ p: 0 }}>
                  {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <List sx={{ width: '100%', p: 0 }}>
                      {sampleData.recentOrders.map((order, index) => (
                        <React.Fragment key={order.id}>
                          <ListItem 
                            alignItems="center"
                            sx={{ 
                              py: 2,
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                              },
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar 
                                sx={{ 
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                }}
                              >
                                <ShoppingCartIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight={500}>
                                  {order.customer}
                                </Typography>
                              }
                              secondary={
                                <Box component="span" display="flex" alignItems="center" gap={0.5}>
                                  <Typography variant="body2" component="span" color="text.secondary">
                                    {order.id}
                                  </Typography>
                                  <Typography variant="body2" component="span" color="text.secondary">
                                    •
                                  </Typography>
                                  <Typography variant="body2" component="span" color="text.secondary">
                                    {order.date}
                                  </Typography>
                                </Box>
                              }
                            />
                            <Box mr={2}>
                              <Typography variant="body1" fontWeight={500}>
                                {formatCurrency(order.amount)}
                              </Typography>
                            </Box>
                            <ListItemSecondaryAction>
                              <Chip 
                                label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
                                size="small"
                                color={getOrderStatusChipColor(order.status)}
                                variant="outlined"
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < sampleData.recentOrders.length - 1 && (
                            <Divider component="li" />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Low Stock Products & Pending Shipments */}
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Low Stock Products */}
            <Grid item xs={12} md={6}>
              <Card sx={{ position: 'relative' }}>
                {loading && (
                  <LinearProgress 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      borderTopLeftRadius: (theme) => theme.shape.borderRadius,
                      borderTopRightRadius: (theme) => theme.shape.borderRadius,
                    }} 
                  />
                )}
                <CardHeader
                  title="Low Stock Alert"
                  titleTypographyProps={{ variant: 'h6' }}
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.warning.main,
                      }}
                    >
                      <WarningIcon />
                    </Avatar>
                  }
                  action={
                    <Button
                      variant="text"
                      color="primary"
                      endIcon={<ArrowForwardIcon />}
                      size="small"
                    >
                      View All
                    </Button>
                  }
                />
                <Divider />
                <CardContent sx={{ p: 0 }}>
                  {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <List sx={{ width: '100%', p: 0 }}>
                      {sampleData.lowStockItems.map((item, index) => (
                        <React.Fragment key={item.id}>
                          <ListItem 
                            alignItems="center" 
                            sx={{ 
                              py: 1.5,
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                              },
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar 
                                variant="rounded"
                                sx={{ 
                                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                                  color: theme.palette.warning.main,
                                }}
                              >
                                <WarningIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight={500}>
                                  {item.name}
                                </Typography>
                              }
                              secondary={
                                <Box component="span" display="flex" alignItems="center" gap={0.5}>
                                  <Typography variant="body2" component="span" color="text.secondary">
                                    {item.id}
                                  </Typography>
                                  <Typography variant="body2" component="span" color="text.secondary">
                                    •
                                  </Typography>
                                  <Typography variant="body2" component="span" color="error">
                                    Reorder Point: {item.reorderLevel}
                                  </Typography>
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Chip 
                                label={`${item.stock} left`} 
                                size="small"
                                color="error"
                                variant="outlined"
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < sampleData.lowStockItems.length - 1 && (
                            <Divider component="li" />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Pending Shipments */}
            <Grid item xs={12} md={6}>
              <Card sx={{ position: 'relative' }}>
                {loading && (
                  <LinearProgress 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      borderTopLeftRadius: (theme) => theme.shape.borderRadius,
                      borderTopRightRadius: (theme) => theme.shape.borderRadius,
                    }} 
                  />
                )}
                <CardHeader
                  title="Pending Shipments"
                  titleTypographyProps={{ variant: 'h6' }}
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.info.main,
                      }}
                    >
                      <LocalShippingIcon />
                    </Avatar>
                  }
                  action={
                    <Button
                      variant="text"
                      color="primary"
                      endIcon={<ArrowForwardIcon />}
                      size="small"
                    >
                      View All
                    </Button>
                  }
                />
                <Divider />
                <CardContent sx={{ p: 0 }}>
                  {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <List sx={{ width: '100%', p: 0 }}>
                      {sampleData.pendingShipments.map((shipment, index) => (
                        <React.Fragment key={shipment.id}>
                          <ListItem
                            alignItems="center"
                            sx={{ 
                              py: 1.5,
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                              },
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar 
                                variant="rounded"
                                sx={{ 
                                  bgcolor: alpha(
                                    shipment.status === 'in_transit' ? 
                                      theme.palette.info.main : 
                                      theme.palette.warning.main, 
                                    0.1
                                  ),
                                  color: shipment.status === 'in_transit' ? 
                                    theme.palette.info.main : 
                                    theme.palette.warning.main,
                                }}
                              >
                                <LocalShippingIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight={500}>
                                  {shipment.destination}
                                </Typography>
                              }
                              secondary={
                                <Box component="span" display="flex" alignItems="center" gap={0.5}>
                                  <Typography variant="body2" component="span" color="text.secondary">
                                    {shipment.id}
                                  </Typography>
                                  <Typography variant="body2" component="span" color="text.secondary">
                                    •
                                  </Typography>
                                  <Typography variant="body2" component="span" color="text.secondary">
                                    {shipment.items} items
                                  </Typography>
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Chip 
                                label={shipment.status === 'in_transit' ? 'In Transit' : 'Pending'} 
                                size="small"
                                color={shipment.status === 'in_transit' ? 'info' : 'warning'}
                                variant="outlined"
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < sampleData.pendingShipments.length - 1 && (
                            <Divider component="li" />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default Dashboard;