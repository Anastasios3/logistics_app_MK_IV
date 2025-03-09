import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerService } from '../../services/api';

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await customerService.getCustomers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await customerService.getCustomerById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await customerService.createCustomer(customerData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, customerData }, { rejectWithValue }) => {
    try {
      const response = await customerService.updateCustomer(id, customerData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (id, { rejectWithValue }) => {
    try {
      const response = await customerService.deleteCustomer(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchCustomerOrders = createAsyncThunk(
  'customers/fetchCustomerOrders',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const response = await customerService.getCustomerOrders(id, params);
      return { id, orders: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Initial state
const initialState = {
  customers: [],
  customer: null,
  customerOrders: {},
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
};

// Slice
const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    resetCustomerStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    clearCurrentCustomer: (state) => {
      state.customer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCustomers
      .addCase(fetchCustomers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.customers = action.payload.results;
        state.pagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
        };
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch customers' };
      })
      
      // fetchCustomerById
      .addCase(fetchCustomerById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.customer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch customer' };
      })
      
      // createCustomer
      .addCase(createCustomer.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.customers.unshift(action.payload);
        state.pagination.count += 1;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to create customer' };
      })
      
      // updateCustomer
      .addCase(updateCustomer.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.customers.findIndex((customer) => customer.id === action.payload.id);
        
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        
        if (state.customer && state.customer.id === action.payload.id) {
          state.customer = action.payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to update customer' };
      })
      
      // deleteCustomer
      .addCase(deleteCustomer.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.customers = state.customers.filter((customer) => customer.id !== action.payload.id);
        state.pagination.count -= 1;
        
        if (state.customer && state.customer.id === action.payload.id) {
          state.customer = null;
        }
        
        // Remove any associated customer orders
        if (state.customerOrders[action.payload.id]) {
          delete state.customerOrders[action.payload.id];
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to delete customer' };
      })
      
      // fetchCustomerOrders
      .addCase(fetchCustomerOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomerOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.customerOrders[action.payload.id] = action.payload.orders;
      })
      .addCase(fetchCustomerOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch customer orders' };
      });
  },
});

// Export actions and reducer
export const { resetCustomerStatus, clearCurrentCustomer } = customersSlice.actions;

// Selectors
export const selectAllCustomers = (state) => state.customers.customers;
export const selectCustomerById = (state) => state.customers.customer;
export const selectCustomerOrders = (id) => (state) => 
  state.customers.customerOrders[id] || { results: [], count: 0, next: null, previous: null };
export const selectCustomerStatus = (state) => state.customers.status;
export const selectCustomerError = (state) => state.customers.error;
export const selectCustomerPagination = (state) => state.customers.pagination;

export default customersSlice.reducer;