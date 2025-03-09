import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supplierService } from '../../services/api';

// Async thunks
export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await supplierService.getSuppliers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchSupplierById = createAsyncThunk(
  'suppliers/fetchSupplierById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await supplierService.getSupplierById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createSupplier = createAsyncThunk(
  'suppliers/createSupplier',
  async (supplierData, { rejectWithValue }) => {
    try {
      const response = await supplierService.createSupplier(supplierData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateSupplier = createAsyncThunk(
  'suppliers/updateSupplier',
  async ({ id, supplierData }, { rejectWithValue }) => {
    try {
      const response = await supplierService.updateSupplier(id, supplierData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  'suppliers/deleteSupplier',
  async (id, { rejectWithValue }) => {
    try {
      const response = await supplierService.deleteSupplier(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Initial state
const initialState = {
  suppliers: [],
  supplier: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
};

// Slice
const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    resetSupplierStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    clearCurrentSupplier: (state) => {
      state.supplier = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSuppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.suppliers = action.payload.results;
        state.pagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
        };
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch suppliers' };
      })
      
      // fetchSupplierById
      .addCase(fetchSupplierById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSupplierById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.supplier = action.payload;
      })
      .addCase(fetchSupplierById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch supplier' };
      })
      
      // createSupplier
      .addCase(createSupplier.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.suppliers.unshift(action.payload);
        state.pagination.count += 1;
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to create supplier' };
      })
      
      // updateSupplier
      .addCase(updateSupplier.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.suppliers.findIndex((supplier) => supplier.id === action.payload.id);
        
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
        
        if (state.supplier && state.supplier.id === action.payload.id) {
          state.supplier = action.payload;
        }
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to update supplier' };
      })
      
      // deleteSupplier
      .addCase(deleteSupplier.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.suppliers = state.suppliers.filter((supplier) => supplier.id !== action.payload.id);
        state.pagination.count -= 1;
        
        if (state.supplier && state.supplier.id === action.payload.id) {
          state.supplier = null;
        }
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to delete supplier' };
      });
  },
});

// Export actions and reducer
export const { resetSupplierStatus, clearCurrentSupplier } = suppliersSlice.actions;

// Selectors
export const selectAllSuppliers = (state) => state.suppliers.suppliers;
export const selectSupplierById = (state) => state.suppliers.supplier;
export const selectSupplierStatus = (state) => state.suppliers.status;
export const selectSupplierError = (state) => state.suppliers.error;
export const selectSupplierPagination = (state) => state.suppliers.pagination;

export default suppliersSlice.reducer;