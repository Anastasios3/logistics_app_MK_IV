import React, { useState, useEffect } from 'react';
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
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  IconButton,
  CircularProgress,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import { 
  fetchOrderById, 
  createOrder, 
  updateOrder, 
  selectOrderById, 
  selectOrderStatus, 
  selectOrderError 
} from '../../store/slices/ordersSlice';
import { fetchCustomers, selectAllCustomers, selectCustomerStatus } from '../../store/slices/customersSlice';
import { fetchProducts, selectAllProducts } from '../../store/slices/inventorySlice';
import { useSnackbar } from 'notistack';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const OrderForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const order = useSelector(selectOrderById);
  const orderStatus = useSelector(selectOrderStatus);
  const orderError = useSelector(selectOrderError);
  
  const customers = useSelector(selectAllCustomers);
  const customerStatus = useSelector(selectCustomerStatus);
  const products = useSelector(selectAllProducts);
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  
  // Initial form values
  const initialValues = {
    customer_id: '',
    status: 'pending',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip_code: '',
    shipping_country: '',
    notes: ''
  };
  
  // Validation schema
  const validationSchema = Yup.object({
    customer_id: Yup.string().required('Customer is required'),
    status: Yup.string().required('Status is required'),
    shipping_address: Yup.string().required('Shipping address is required'),
    shipping_city: Yup.string().required('City is required'),
    shipping_state: Yup.string().required('State is required'),
    shipping_zip_code: Yup.string().required('ZIP code is required'),
    shipping_country: Yup.string().required('Country is required'),
  });
  
  // Formik setup
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (orderItems.length === 0) {
        enqueueSnackbar('Please add at least one item to the order', { variant: 'error' });
        return;
      }
      
      const orderData = {
        ...values,
        items: orderItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      };
      
      if (isEditMode) {
        dispatch(updateOrder({ id, orderData }))
          .unwrap()
          .then(() => {
            enqueueSnackbar('Order updated successfully', { variant: 'success' });
            navigate(`/orders/${id}`);
          })
          .catch((error) => {
            enqueueSnackbar(error.message || 'Failed to update order', { variant: 'error' });
          });
      } else {
        dispatch(createOrder(orderData))
          .unwrap()
          .then((newOrder) => {
            enqueueSnackbar('Order created successfully', { variant: 'success' });
            navigate(`/orders/${newOrder.id}`);
          })
          .catch((error) => {
            enqueueSnackbar(error.message || 'Failed to create order', { variant: 'error' });
          });
      }
    },
  });
  
  // Load data on component mount
  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchProducts());
    
    if (isEditMode) {
      dispatch(fetchOrderById(id));
    }
  }, [dispatch, id, isEditMode]);
  
  // Set form values when editing an existing order
  useEffect(() => {
    if (isEditMode && order && customers.length > 0) {
      formik.setValues({
        customer_id: order.customer?.id || '',
        status: order.status || 'pending',
        shipping_address: order.shipping_address || '',
        shipping_city: order.shipping_city || '',
        shipping_state: order.shipping_state || '',
        shipping_zip_code: order.shipping_zip_code || '',
        shipping_country: order.shipping_country || '',
        notes: order.notes || ''
      });
      
      const customer = customers.find(c => c.id === order.customer?.id);
      setSelectedCustomer(customer || null);
      
      if (order.items && order.items.length > 0) {
        setOrderItems(order.items.map(item => ({
          id: item.id,
          product: item.product,
          quantity: item.quantity,
          unit_price: item.unit_price
        })));
      }
    }
  }, [isEditMode, order, customers, formik]);
  
  // Handle customer selection
  const handleCustomerChange = (event, value) => {
    setSelectedCustomer(value);
    if (value) {
      formik.setFieldValue('customer_id', value.id);
      // Auto-fill shipping address with customer address
      formik.setFieldValue('shipping_address', value.address || '');
      formik.setFieldValue('shipping_city', value.city || '');
      formik.setFieldValue('shipping_state', value.state || '');
      formik.setFieldValue('shipping_zip_code', value.zip_code || '');
      formik.setFieldValue('shipping_country', value.country || '');
    } else {
      formik.setFieldValue('customer_id', '');
    }
  };
  
  // Add item to order
  const handleAddItem = () => {
    if (!selectedProduct) {
      enqueueSnackbar('Please select a product', { variant: 'error' });
      return;
    }
    
    if (itemQuantity <= 0) {
      enqueueSnackbar('Quantity must be greater than 0', { variant: 'error' });
      return;
    }
    
    // Check if product is already in the order
    const existingItemIndex = orderItems.findIndex(item => item.product.id === selectedProduct.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += itemQuantity;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      setOrderItems([
        ...orderItems,
        {
          product: selectedProduct,
          quantity: itemQuantity,
          unit_price: selectedProduct.price
        }
      ]);
    }
    
    // Reset selection
    setSelectedProduct(null);
    setItemQuantity(1);
  };
  
  // Remove item from order
  const handleRemoveItem = (index) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };
  
  // Calculate order total
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      return total + (item.quantity * parseFloat(item.unit_price));
    }, 0);
  };
  
  if (isEditMode && orderStatus === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton 
          component={Link} 
          to="/orders"
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEditMode ? `Edit Order #${order?.order_number}` : 'Create New Order'}
        </Typography>
      </Box>
      
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Customer and Status */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    id="customer-select"
                    options={customers}
                    loading={customerStatus === 'loading'}
                    getOptionLabel={(option) => option.name}
                    value={selectedCustomer}
                    onChange={handleCustomerChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Customer"
                        variant="outlined"
                        fullWidth
                        required
                        error={formik.touched.customer_id && Boolean(formik.errors.customer_id)}
                        helperText={formik.touched.customer_id && formik.errors.customer_id}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {customerStatus === 'loading' ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      id="status"
                      name="status"
                      value={formik.values.status}
                      onChange={formik.handleChange}
                      label="Status"
                      error={formik.touched.status && Boolean(formik.errors.status)}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="processing">Processing</MenuItem>
                      <MenuItem value="shipped">Shipped</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                      <MenuItem value="returned">Returned</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Shipping Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Shipping Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    id="shipping_address"
                    name="shipping_address"
                    label="Address"
                    variant="outlined"
                    fullWidth
                    required
                    value={formik.values.shipping_address}
                    onChange={formik.handleChange}
                    error={formik.touched.shipping_address && Boolean(formik.errors.shipping_address)}
                    helperText={formik.touched.shipping_address && formik.errors.shipping_address}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    id="shipping_city"
                    name="shipping_city"
                    label="City"
                    variant="outlined"
                    fullWidth
                    required
                    value={formik.values.shipping_city}
                    onChange={formik.handleChange}
                    error={formik.touched.shipping_city && Boolean(formik.errors.shipping_city)}
                    helperText={formik.touched.shipping_city && formik.errors.shipping_city}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    id="shipping_state"
                    name="shipping_state"
                    label="State/Province"
                    variant="outlined"
                    fullWidth
                    required
                    value={formik.values.shipping_state}
                    onChange={formik.handleChange}
                    error={formik.touched.shipping_state && Boolean(formik.errors.shipping_state)}
                    helperText={formik.touched.shipping_state && formik.errors.shipping_state}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    id="shipping_zip_code"
                    name="shipping_zip_code"
                    label="ZIP/Postal Code"
                    variant="outlined"
                    fullWidth
                    required
                    value={formik.values.shipping_zip_code}
                    onChange={formik.handleChange}
                    error={formik.touched.shipping_zip_code && Boolean(formik.errors.shipping_zip_code)}
                    helperText={formik.touched.shipping_zip_code && formik.errors.shipping_zip_code}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    id="shipping_country"
                    name="shipping_country"
                    label="Country"
                    variant="outlined"
                    fullWidth
                    required
                    value={formik.values.shipping_country}
                    onChange={formik.handleChange}
                    error={formik.touched.shipping_country && Boolean(formik.errors.shipping_country)}
                    helperText={formik.touched.shipping_country && formik.errors.shipping_country}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Order Items */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <CartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Order Items
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    id="product-select"
                    options={products}
                    getOptionLabel={(option) => `${option.name} (${option.sku})`}
                    value={selectedProduct}
                    onChange={(event, value) => setSelectedProduct(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Product"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    id="quantity"
                    label="Quantity"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(parseInt(e.target.value) || 0)}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                    fullWidth
                    sx={{ height: '100%' }}
                  >
                    Add Item
                  </Button>
                </Grid>
              </Grid>
              
              {/* Item List */}
              {orderItems.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body1">{item.product.name}</Typography>
                            <Typography variant="body2" color="text.secondary">SKU: {item.product.sku}</Typography>
                          </TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">${parseFloat(item.unit_price).toFixed(2)}</TableCell>
                          <TableCell align="right">${(item.quantity * parseFloat(item.unit_price)).toFixed(2)}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveItem(index)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography variant="h6">Total:</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6">${calculateTotal().toFixed(2)}</Typography>
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    bgcolor: 'background.default',
                    borderStyle: 'dashed'
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No items added to this order yet.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use the form above to add products to the order.
                  </Typography>
                </Paper>
              )}
            </Paper>
          </Grid>
          
          {/* Notes */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Additional Notes
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <TextField
                id="notes"
                name="notes"
                label="Order Notes"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={formik.values.notes}
                onChange={formik.handleChange}
              />
            </Paper>
          </Grid>
          
          {/* Submit Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                component={Link}
                to="/orders"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={orderStatus === 'loading'}
              >
                {isEditMode ? 'Update Order' : 'Create Order'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default OrderForm;