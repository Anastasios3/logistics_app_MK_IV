import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  MenuItem,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
  Badge,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  useTheme,
} from '@mui/material';

// Icons
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import WarningIcon from '@mui/icons-material/Warning';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import SettingsIcon from '@mui/icons-material/Settings';

// Sample notification data
const sampleNotifications = {
  all: [
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      message: 'Order #ORD-2023-05-12 from Acme Corporation.',
      time: '10 minutes ago',
      read: false,
      link: '/orders/ORD-2023-05-12',
    },
    {
      id: 2,
      type: 'shipment',
      title: 'Shipment Delayed',
      message: 'Shipment #SHP-2023-05-09 to Miami, FL is delayed.',
      time: '1 hour ago',
      read: false,
      link: '/shipments/SHP-2023-05-09',
    },
    {
      id: 3,
      type: 'inventory',
      title: 'Low Stock Alert',
      message: 'Wireless Earbuds inventory has reached the reorder level.',
      time: '3 hours ago',
      read: true,
      link: '/inventory/products/PRD-001',
    },
    {
      id: 4,
      type: 'order',
      title: 'Order Canceled',
      message: 'Order #ORD-2023-05-10 has been canceled by the customer.',
      time: '5 hours ago',
      read: true,
      link: '/orders/ORD-2023-05-10',
    },
    {
      id: 5,
      type: 'system',
      title: 'System Update',
      message: 'System will undergo maintenance on May 15, 2023 at 2:00 AM UTC.',
      time: '1 day ago',
      read: true,
      link: '/settings',
    },
  ],
  unread: [
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      message: 'Order #ORD-2023-05-12 from Acme Corporation.',
      time: '10 minutes ago',
      read: false,
      link: '/orders/ORD-2023-05-12',
    },
    {
      id: 2,
      type: 'shipment',
      title: 'Shipment Delayed',
      message: 'Shipment #SHP-2023-05-09 to Miami, FL is delayed.',
      time: '1 hour ago',
      read: false,
      link: '/shipments/SHP-2023-05-09',
    },
  ],
};

const NotificationsMenu = ({ anchorEl, open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState({
    all: [],
    unread: [],
  });
  
  useEffect(() => {
    // Simulate API call to fetch notifications
    const timer = setTimeout(() => {
      setNotifications(sampleNotifications);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleNotificationClick = (link) => {
    onClose();
    navigate(link);
  };
  
  const handleMarkAllAsRead = () => {
    // Simulate marking all as read
    setNotifications((prev) => ({
      all: prev.all.map((notification) => ({ ...notification, read: true })),
      unread: [],
    }));
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return (
          <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
            <ShoppingCartIcon />
          </Avatar>
        );
      case 'shipment':
        return (
          <Avatar sx={{ bgcolor: theme.palette.info.light }}>
            <LocalShippingIcon />
          </Avatar>
        );
      case 'inventory':
        return (
          <Avatar sx={{ bgcolor: theme.palette.warning.light }}>
            <InventoryIcon />
          </Avatar>
        );
      case 'system':
        return (
          <Avatar sx={{ bgcolor: theme.palette.success.light }}>
            <SettingsIcon />
          </Avatar>
        );
      default:
        return (
          <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
            <NotificationsNoneIcon />
          </Avatar>
        );
    }
  };
  
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 360,
          maxHeight: 480,
          overflow: 'hidden',
          mt: 1.5,
          '& .MuiList-root': {
            padding: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Notifications</Typography>
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={handleMarkAllAsRead}
            disabled={notifications.unread.length === 0 || loading}
            title="Mark all as read"
          >
            <CheckCircleIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            title="Clear all notifications"
            disabled={loading}
          >
            <ClearAllIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      <Divider />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ minHeight: 48 }}
        >
          <Tab 
            label="All" 
            id="notifications-tab-0" 
            sx={{ minHeight: 48 }}
          />
          <Tab 
            label={
              <Badge
                color="error"
                badgeContent={notifications.unread.length}
                max={99}
              >
                Unread
              </Badge>
            } 
            id="notifications-tab-1" 
            sx={{ minHeight: 48 }}
          />
        </Tabs>
      </Box>
      
      <Box sx={{ height: 320, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <>
            {activeTab === 0 && (
              <List sx={{ width: '100%', p: 0 }}>
                {notifications.all.length > 0 ? (
                  notifications.all.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          py: 1.5,
                          backgroundColor: notification.read ? 'transparent' : 'action.hover',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.selected',
                          },
                        }}
                        onClick={() => handleNotificationClick(notification.link)}
                      >
                        <ListItemAvatar>{getNotificationIcon(notification.type)}</ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: notification.read ? 400 : 600,
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              {notification.title}
                              {!notification.read && (
                                <Box
                                  component="span"
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: 'error.main',
                                    ml: 1,
                                    display: 'inline-block',
                                  }}
                                />
                              )}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography
                                variant="body2"
                                color="text.primary"
                                sx={{
                                  display: 'block',
                                  fontWeight: notification.read ? 400 : 500,
                                }}
                              >
                                {notification.message}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mt: 0.5 }}
                              >
                                {notification.time}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < notifications.all.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 4,
                      height: '100%',
                      textAlign: 'center',
                    }}
                  >
                    <NotificationsNoneIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You have no notifications at the moment.
                    </Typography>
                  </Box>
                )}
              </List>
            )}
            
            {activeTab === 1 && (
              <List sx={{ width: '100%', p: 0 }}>
                {notifications.unread.length > 0 ? (
                  notifications.unread.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          py: 1.5,
                          backgroundColor: 'action.hover',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.selected',
                          },
                        }}
                        onClick={() => handleNotificationClick(notification.link)}
                      >
                        <ListItemAvatar>{getNotificationIcon(notification.type)}</ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              {notification.title}
                              <Box
                                component="span"
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: 'error.main',
                                  ml: 1,
                                  display: 'inline-block',
                                }}
                              />
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography
                                variant="body2"
                                color="text.primary"
                                sx={{
                                  display: 'block',
                                  fontWeight: 500,
                                }}
                              >
                                {notification.message}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mt: 0.5 }}
                              >
                                {notification.time}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < notifications.unread.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 4,
                      height: '100%',
                      textAlign: 'center',
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      All Caught Up!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You have no unread notifications.
                    </Typography>
                  </Box>
                )}
              </List>
            )}
          </>
        )}
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
        <Button
          size="small"
          sx={{ width: '100%' }}
          onClick={() => {
            onClose();
            navigate('/settings/notifications');
          }}
        >
          View All Notifications
        </Button>
      </Box>
    </Menu>
  );
};

export default NotificationsMenu;