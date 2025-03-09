import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Divider, 
  Grid, 
  Typography, 
  Paper, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  LocalShipping as ShippingIcon,
  Email as EmailIcon,
  AttachMoney as PaymentIcon
} from '@mui/icons-material';
import { fetchOrderById, deleteOrder, selectOrderById, selectOrderStatus, selectOrderError } from '../../store/slices/ordersSlice';
import { useSnackbar } from 'notistack';

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const order = useSelector(selectOrderById);
  const status = useSelector(selectOrderStatus);
  const error = useSelector(selectOrderError);
  
  const [openDialog, setOpenDialog] = useState(false);
  
  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);
  
  const handleDeleteOrder = () => {
    dispatch(deleteOrder(id))
      .unwrap()
      .then(() => {
        enqueueSnackbar('Order deleted successfully', { variant: 'success' });
        navigate('/orders');
      })
      .catch((error) => {
        enqueueSnackbar(error.message || 'Failed to delete order', { variant: 'error' });
      });
    setOpenDialog(false);
  };
  
  const getStatusStep = (status) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      case 'returned':
        return 4;
      default:
        return 0;
    }
  };
  
  const renderOrderStatus = (status) => {
    let color;
    
    switch (status) {
      case 'pending':
        color = 'warning';
        break;
      case 'processing':
        color = 'info';
        break;
      case 'shipped':
        color = 'primary';
        break;
      case 'delivered':
        color = 'success';
        break;
      case 'cancelled':
        color = 'error';
        break;
      case 'returned':
        color = 'secondary';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status.charAt(0).toUpperCase() + status.slice(1)} 
        color={color} 
        size="medium" 
      />
    );
  };
  
  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (status === 'failed') {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 3, mt: 3, bgcolor: '#FFF5F5' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error Loading Order
          </Typography>
          <Typography>
            {error?.message || 'Could not load order details. Please try again later.'}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />} 
            component={Link} 
            to="/orders"
            sx={{ mt: 2 }}
          >
            Back to Orders
          </Button>
        </Paper>
      </Container>
    );
  }
  
  if (!order) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Order Not Found
          </Typography>
          <Typography>
            The order you are looking for does not exist or has been deleted.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />} 
            component={Link} 
            to="/orders"
            sx={{ mt: 2 }}
          >
            Back to Orders
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            component={Link} 
            to="/orders"
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              Order #{order.order_number}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {new Date(order.order_date).toLocaleDateString()} | {order.customer?.name}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={() => enqueueSnackbar('Print functionality coming soon', { variant: 'info' })}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EmailIcon />}
            onClick={() => enqueueSnackbar('Email functionality coming soon', { variant: 'info' })}
          >
            Email
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={`/orders/${order.id}/edit`}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Delete
          </Button>
        </Box>
      </Box>
      
      {/* Order Status */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Order Status</Typography>
          {renderOrderStatus(order.status)}
        </Box>
        
        {order.status !== 'cancelled' && (
          <Stepper activeStep={getStatusStep(order.status)} sx={{ mt: 3 }}>
            <Step>
              <StepLabel>Pending</StepLabel>
            </Step>
            <Step>
              <StepLabel>Processing</StepLabel>
            </Step>
            <Step>
              <StepLabel>Shipped</StepLabel>
            </Step>
            <Step>
              <StepLabel>Delivered</StepLabel>
            </Step>
            {order.status === 'returned' && (
              <Step>
                <StepLabel>Returned</StepLabel>
              </Step>
            )}
          </Stepper>
        )}
        
        {order.status === 'cancelled' && (
          <Box sx={{ p: 2, bgcolor: '#FFF5F5', borderRadius: 1, mt: 2 }}>
            <Typography variant="body1" color="error">
              This order has been cancelled.
              {order.notes && ` Reason: ${order.notes}`}
            </Typography>
          </Box>
        )}
      </Paper>
      
      <Grid container spacing={3}>
        {/* Order Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="body1">{item.product.name}</Typography>
                          <Typography variant="body2" color="text.secondary">SKU: {item.product.sku}</Typography>
                        </TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">${parseFloat(item.unit_price).toFixed(2)}</TableCell>
                        <TableCell align="right">${parseFloat(item.unit_price * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Grid container spacing={1} sx={{ maxWidth: 300 }}>
                  <Grid item xs={6}>
                    <Typography variant="body1">Subtotal:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">Shipping:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right">
                      ${(0).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">Tax:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right">
                      ${(0).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6">Total:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" align="right">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
          
          {/* Shipment Information */}
          {order.shipments && order.shipments.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    <ShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Shipment Information
                  </Typography>
                  {order.tracking_number && (
                    <Chip 
                      label={`Tracking: ${order.tracking_number}`} 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {order.shipments.map((shipment) => (
                  <Box key={shipment.id} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">
                      Shipment #{shipment.shipment_number}
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Typography variant="body1">{shipment.status}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Estimated Delivery</Typography>
                        <Typography variant="body1">
                          {shipment.estimated_arrival ? new Date(shipment.estimated_arrival).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Shipped Via</Typography>
                        <Typography variant="body1">
                          {shipment.vehicle ? `${shipment.vehicle.vehicle_type} (${shipment.vehicle.vehicle_number})` : 'Not assigned'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
        
        {/* Customer and Shipping Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle1">
                {order.customer?.name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                {order.customer?.email}
              </Typography>
              <Typography variant="body2" gutterBottom>
                {order.customer?.phone}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  component={Link}
                  to={`/customers/${order.customer?.id}`}
                >
                  View Customer Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body1" gutterBottom>
                {order.shipping_address}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {order.shipping_country}
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Payment Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body1" gutterBottom>
                Payment Method: Credit Card
              </Typography>
              <Typography variant="body1" gutterBottom>
                Payment Status: Paid
              </Typography>
            </CardContent>
          </Card>
          
          {order.notes && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notes
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body1">
                  {order.notes}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete order #{order.order_number}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteOrder} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderDetail;