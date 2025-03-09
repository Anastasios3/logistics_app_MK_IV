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
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  TransferWithinAStation as TransferIcon
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { 
  fetchProducts, 
  fetchInventory,
  fetchCategories,
  fetchWarehouses,
  fetchLowStockItems,
  deleteProduct,
  selectAllProducts,
  selectInventory,
  selectCategories,
  selectWarehouses,
  selectLowStockItems,
  selectInventoryStatus
} from '../../store/slices/inventorySlice';
import { useSnackbar } from 'notistack';

const InventoryList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const products = useSelector(selectAllProducts);
  const inventory = useSelector(selectInventory);
  const categories = useSelector(selectCategories);
  const warehouses = useSelector(selectWarehouses);
  const lowStockItems = useSelector(selectLowStockItems);
  const status = useSelector(selectInventoryStatus);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchWarehouses());
    dispatch(fetchLowStockItems());
  }, [dispatch]);
  
  useEffect(() => {
    if (tabValue === 0) {
      // Products tab
      const params = {
        page: page + 1,
        limit: pageSize,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'all' && { category: categoryFilter })
      };
      
      dispatch(fetchProducts(params));
    } else {
      // Inventory tab
      const params = {
        page: page + 1,
        limit: pageSize,
        ...(searchTerm && { search: searchTerm }),
        ...(warehouseFilter !== 'all' && { warehouse: warehouseFilter })
      };
      
      dispatch(fetchInventory(params));
    }
  }, [dispatch, tabValue, page, pageSize, searchTerm, categoryFilter, warehouseFilter]);
  
  const handleRefresh = () => {
    if (tabValue === 0) {
      const params = {
        page: page + 1,
        limit: pageSize,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'all' && { category: categoryFilter })
      };
      
      dispatch(fetchProducts(params));
    } else {
      const params = {
        page: page + 1,
        limit: pageSize,
        ...(searchTerm && { search: searchTerm }),
        ...(warehouseFilter !== 'all' && { warehouse: warehouseFilter })
      };
      
      dispatch(fetchInventory(params));
    }
  };
  
  const handleSearch = (event) => {
    event.preventDefault();
    setPage(0);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    setSearchTerm('');
    setCategoryFilter('all');
    setWarehouseFilter('all');
  };
  
  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id))
        .unwrap()
        .then(() => {
          enqueueSnackbar('Product deleted successfully', { variant: 'success' });
        })
        .catch((error) => {
          enqueueSnackbar(error.message || 'Failed to delete product', { variant: 'error' });
        });
    }
  };
  
  // Function to render product stock status with color-coded chips
  const renderStockStatus = (item) => {
    const totalQuantity = item.quantity || 0;
    const reorderLevel = item.product?.reorder_level || 0;
    
    if (totalQuantity <= 0) {
      return <Chip label="Out of Stock" color="error" size="small" />;
    } else if (totalQuantity <= reorderLevel) {
      return <Chip label="Low Stock" color="warning" size="small" />;
    } else {
      return <Chip label="In Stock" color="success" size="small" />;
    }
  };
  
  // Define columns for the products data grid
  const productColumns = [
    { 
      field: 'name', 
      headerName: 'Product', 
      flex: 2,
      renderCell: (params) => (
        <Box>
          <Typography variant="body1">{params.value}</Typography>
          <Typography variant="body2" color="text.secondary">SKU: {params.row.sku}</Typography>
        </Box>
      )
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      flex: 1,
      valueGetter: (params) => params.row.category?.name || 'N/A'
    },
    { 
      field: 'price', 
      headerName: 'Price', 
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return '$0.00';
        return `$${parseFloat(params.value).toFixed(2)}`;
      }
    },
    { 
      field: 'dimensions', 
      headerName: 'Dimensions', 
      flex: 1
    },
    { 
      field: 'weight', 
      headerName: 'Weight', 
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return '0 kg';
        return `${params.value} kg`;
      }
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
              onClick={() => navigate(`/inventory/products/${params.row.id}`)}
              size="small"
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton 
              color="info" 
              onClick={() => navigate(`/inventory/products/${params.row.id}/edit`)}
              size="small"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              color="error" 
              onClick={() => handleDeleteProduct(params.row.id)}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];
  
  // Define columns for the inventory data grid
  const inventoryColumns = [
    { 
      field: 'product', 
      headerName: 'Product', 
      flex: 2,
      valueGetter: (params) => params.row.product?.name || 'N/A',
      renderCell: (params) => (
        <Box>
          <Typography variant="body1">{params.row.product?.name}</Typography>
          <Typography variant="body2" color="text.secondary">SKU: {params.row.product?.sku}</Typography>
        </Box>
      )
    },
    { 
      field: 'warehouse', 
      headerName: 'Warehouse', 
      flex: 1.5,
      valueGetter: (params) => params.row.warehouse?.name || 'N/A'
    },
    { 
      field: 'quantity', 
      headerName: 'Quantity', 
      flex: 1,
      align: 'center'
    },
    { 
      field: 'stock_status', 
      headerName: 'Status', 
      flex: 1,
      renderCell: (params) => renderStockStatus(params.row)
    },
    { 
      field: 'last_restock_date', 
      headerName: 'Last Restock', 
      flex: 1.5,
      valueFormatter: (params) => {
        if (!params.value) return 'N/A';
        return new Date(params.value).toLocaleDateString();
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Transfer Stock">
            <IconButton 
              color="primary" 
              onClick={() => navigate(`/inventory/transfer/${params.row.id}`)}
              size="small"
            >
              <TransferIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Update Stock">
            <IconButton 
              color="info" 
              onClick={() => navigate(`/inventory/update/${params.row.id}`)}
              size="small"
            >
              <EditIcon />
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
          Inventory Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your products and inventory across warehouses
        </Typography>
      </Box>
      
      {/* Tabs for switching between Products and Inventory */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Products" />
          <Tab label="Inventory" />
        </Tabs>
      </Paper>
      
      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={tabValue === 0 ? "Search products by name, SKU, etc." : "Search inventory by product, warehouse, etc."}
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
            {tabValue === 0 ? (
              <TextField
                select
                fullWidth
                variant="outlined"
                label="Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                InputProps={{
                  startAdornment: <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                select
                fullWidth
                variant="outlined"
                label="Warehouse"
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                InputProps={{
                  startAdornment: <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              >
                <MenuItem value="all">All Warehouses</MenuItem>
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</MenuItem>
                ))}
              </TextField>
            )}
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
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
            {tabValue === 0 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                component={Link}
                to="/inventory/products/new"
              >
                New Product
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <div style={{ height: 650, width: '100%' }}>
            <DataGrid
              rows={tabValue === 0 ? products : inventory}
              columns={tabValue === 0 ? productColumns : inventoryColumns}
              pagination
              paginationMode="server"
              rowCount={100} // Replace with actual count from pagination
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
                  sortModel: [{ field: tabValue === 0 ? 'name' : 'product', sort: 'asc' }],
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Low Stock Items Section */}
      {lowStockItems.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Low Stock Items
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These items are below their reorder level and need to be restocked
          </Typography>
          
          <Grid container spacing={2}>
            {lowStockItems.slice(0, 4).map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom noWrap>
                      {item.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      SKU: {item.product.sku}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2">
                        Quantity: <b>{item.quantity}</b>
                      </Typography>
                      <Typography variant="body2">
                        Reorder Level: <b>{item.product.reorder_level}</b>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Chip label="Low Stock" color="warning" size="small" />
                      <Button 
                        variant="outlined" 
                        size="small"
                        component={Link}
                        to={`/inventory/update/${item.id}`}
                      >
                        Restock
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {lowStockItems.length > 4 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate('/inventory/low-stock')}
              >
                View All Low Stock Items ({lowStockItems.length})
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default InventoryList;