import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inventoryService } from '../../services/api';

// Async thunks
export const fetchProducts = createAsyncThunk(
  'inventory/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getProducts(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'inventory/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getProductById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createProduct = createAsyncThunk(
  'inventory/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await inventoryService.createProduct(productData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateProduct = createAsyncThunk(
  'inventory/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.updateProduct(id, productData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'inventory/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      const response = await inventoryService.deleteProduct(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'inventory/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getCategories();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getInventory(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateInventory = createAsyncThunk(
  'inventory/updateInventory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.updateInventory(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const transferStock = createAsyncThunk(
  'inventory/transferStock',
  async (transferData, { rejectWithValue }) => {
    try {
      const response = await inventoryService.transferStock(transferData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchLowStockItems = createAsyncThunk(
  'inventory/fetchLowStockItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getLowStockItems();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchWarehouses = createAsyncThunk(
  'inventory/fetchWarehouses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getWarehouses();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchWarehouseById = createAsyncThunk(
  'inventory/fetchWarehouseById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getWarehouseById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Initial state
const initialState = {
  products: [],
  product: null,
  categories: [],
  inventory: [],
  warehouses: [],
  warehouse: null,
  lowStockItems: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
};

// Slice
const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.product = null;
    },
    clearCurrentWarehouse: (state) => {
      state.warehouse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload.results;
        state.pagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch products' };
      })
      
      // fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch product' };
      })
      
      // createProduct
      .addCase(createProduct.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products.unshift(action.payload);
        state.pagination.count += 1;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to create product' };
      })
      
      // updateProduct
      .addCase(updateProduct.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.products.findIndex((product) => product.id === action.payload.id);
        
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        
        if (state.product && state.product.id === action.payload.id) {
          state.product = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to update product' };
      })
      
      // deleteProduct
      .addCase(deleteProduct.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = state.products.filter((product) => product.id !== action.payload.id);
        state.pagination.count -= 1;
        
        if (state.product && state.product.id === action.payload.id) {
          state.product = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to delete product' };
      })
      
      // fetchCategories
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch categories' };
      })
      
      // fetchInventory
      .addCase(fetchInventory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.inventory = action.payload.results;
        state.pagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
        };
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch inventory' };
      })
      
      // updateInventory
      .addCase(updateInventory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateInventory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.inventory.findIndex((item) => item.id === action.payload.id);
        
        if (index !== -1) {
          state.inventory[index] = action.payload;
        }
      })
      .addCase(updateInventory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to update inventory' };
      })
      
      // transferStock
      .addCase(transferStock.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(transferStock.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Updated inventory items should be refetched
      })
      .addCase(transferStock.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to transfer stock' };
      })
      
      // fetchLowStockItems
      .addCase(fetchLowStockItems.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLowStockItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lowStockItems = action.payload;
      })
      .addCase(fetchLowStockItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch low stock items' };
      })
      
      // fetchWarehouses
      .addCase(fetchWarehouses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.warehouses = action.payload;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch warehouses' };
      })
      
      // fetchWarehouseById
      .addCase(fetchWarehouseById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWarehouseById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.warehouse = action.payload;
      })
      .addCase(fetchWarehouseById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch warehouse' };
      });
  },
});

// Export actions and reducer
export const { resetStatus, clearCurrentProduct, clearCurrentWarehouse } = inventorySlice.actions;

// Selectors
export const selectAllProducts = (state) => state.inventory.products;
export const selectProductById = (state) => state.inventory.product;
export const selectCategories = (state) => state.inventory.categories;
export const selectInventory = (state) => state.inventory.inventory;
export const selectWarehouses = (state) => state.inventory.warehouses;
export const selectWarehouseById = (state) => state.inventory.warehouse;
export const selectLowStockItems = (state) => state.inventory.lowStockItems;
export const selectInventoryStatus = (state) => state.inventory.status;
export const selectInventoryError = (state) => state.inventory.error;
export const selectInventoryPagination = (state) => state.inventory.pagination;

export default inventorySlice.reducer;