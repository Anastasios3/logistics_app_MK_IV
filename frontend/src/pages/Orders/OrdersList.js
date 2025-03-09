import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Grid, 
  Typography, 
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Paper,
  Tooltip,
  Divider 
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { fetchOrders, deleteOrder, selectAllOrders, selectOrderStatus, selectOrderPagination } from '../../store/slices/ordersSlice';
import { useSnackbar } from 'notistack';

const OrdersList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const orders = useSelector(selectAllOrders);
  const status = useSelector(selectOrderStatus);
  const pagination = useSelector(selectOrderPagination);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  useEffect(() => {
    const params = {
      page: page + 1,
      limit: pageSize,
      ...(searchTerm && { search: searchTerm }),
      ...(statusFilter !== 'all' && { status: statusFilter })
    };
    
    dispatch(fetchOrders(params));
  }, [dispatch, page, pageSize, searchTerm, statusFilter]);
  
  const handleRefresh = () => {
    const params = {
      page: page + 1,
      limit: pageSize,
      ...(searchTerm && { search: searchTerm }),
      ...(statusFilter !== 'all' && { status: statusFilter })
    };
    
    dispatch(fetchOrders(params));
  };
  
  const handleSearch = (event) => {
    event.preventDefault();
    setPage(0);
  };
  
  const handleDeleteOrder = (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      dispatch(deleteOrder(id))
        .unwrap()
        .then(() => {
          enqueueSnackbar('Order deleted successfully', { variant: 'success' });
        })
        .catch((error) => {
          enqueueSnackbar(error.message || 'Failed to delete order', { variant: 'error' });
        });
    }
  };
  
  // Function to render the order status with color-coded chips
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
        size="small" 
      />
    );
  };
  
  // Define columns for the data grid
  const columns = [
    { field: 'order_number', headerName: 'Order #', flex: 1 },
    { 
      field: 'customer', 
      headerName: 'Customer', 
      flex: 1.5,
      valueGetter: (params) => params.row.customer?.name || 'N/A'
    },
    { 
      field: 'order_date', 
      headerName: 'Order Date', 
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return 'N/A';
        return new Date(params.value).toLocaleDateString();
      }
    },
    { 
      field: 'total_amount', 
      headerName: 'Total Amount', 
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return '$0.00';
        return `$${parseFloat(params.value).toFixed(2)}`;
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1,
      renderCell: (params) => renderOrderStatus(params.value)
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View">
            <IconButton 
              color="primary" 
              onClick={() => navigate(`/orders/${params.row.id}`)}
              size="small"
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton 
              color="info" 
              onClick={() => navigate(`/orders/${params.row.id}/edit`)}
              size="small"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              color="error" 
              onClick={() => handleDeleteOrder(params.row.id)}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Orders
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage all customer orders
        </Typography>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search orders by number, customer name, etc."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  endAdornment: (
                    <Button type="submit" color="primary" variant="contained" sx={{ ml: 1 }}>
                      Search
                    </Button>
                  )
                }}
              />
            </form>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              variant="outlined"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              InputProps={{
                startAdornment: <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="returned">Returned</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ExportIcon />}
              onClick={() => enqueueSnackbar('Export functionality coming soon', { variant: 'info' })}
            >
              Export
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={Link}
              to="/orders/new"
            >
              New Order
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <div style={{ height: 650, width: '100%' }}>
            <DataGrid
              rows={orders}
              columns={columns}
              pagination
              paginationMode="server"
              rowCount={pagination.count}
              page={page}
              pageSize={pageSize}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              loading={status === 'loading'}
              disableSelectionOnClick
              autoHeight
              components={{
                Toolbar: GridToolbar
              }}
              initialState={{
                sorting: {
                  sortModel: [{ field: 'order_date', sort: 'desc' }],
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};

export default OrdersList;