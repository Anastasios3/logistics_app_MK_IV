import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { shipmentService } from '../../services/api';

// Async thunks
export const fetchShipments = createAsyncThunk(
  'shipments/fetchShipments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await shipmentService.getShipments(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchShipmentById = createAsyncThunk(
  'shipments/fetchShipmentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await shipmentService.getShipmentById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createShipment = createAsyncThunk(
  'shipments/createShipment',
  async (shipmentData, { rejectWithValue }) => {
    try {
      const response = await shipmentService.createShipment(shipmentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateShipment = createAsyncThunk(
  'shipments/updateShipment',
  async ({ id, shipmentData }, { rejectWithValue }) => {
    try {
      const response = await shipmentService.updateShipment(id, shipmentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteShipment = createAsyncThunk(
  'shipments/deleteShipment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await shipmentService.deleteShipment(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchShipmentTracking = createAsyncThunk(
  'shipments/fetchShipmentTracking',
  async (id, { rejectWithValue }) => {
    try {
      const response = await shipmentService.getShipmentTracking(id);
      return { id, tracking: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const addTrackingUpdate = createAsyncThunk(
  'shipments/addTrackingUpdate',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await shipmentService.addTrackingUpdate(id, updateData);
      return { id, update: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchVehicles = createAsyncThunk(
  'shipments/fetchVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await shipmentService.getVehicles();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchDrivers = createAsyncThunk(
  'shipments/fetchDrivers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await shipmentService.getDrivers();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Initial state
const initialState = {
  shipments: [],
  shipment: null,
  tracking: {},
  vehicles: [],
  drivers: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
};

// Slice
const shipmentsSlice = createSlice({
  name: 'shipments',
  initialState,
  reducers: {
    resetShipmentStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    clearCurrentShipment: (state) => {
      state.shipment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchShipments
      .addCase(fetchShipments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchShipments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.shipments = action.payload.results;
        state.pagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
        };
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch shipments' };
      })
      
      // fetchShipmentById
      .addCase(fetchShipmentById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchShipmentById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.shipment = action.payload;
      })
      .addCase(fetchShipmentById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch shipment' };
      })
      
      // createShipment
      .addCase(createShipment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createShipment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.shipments.unshift(action.payload);
        state.pagination.count += 1;
      })
      .addCase(createShipment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to create shipment' };
      })
      
      // updateShipment
      .addCase(updateShipment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateShipment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.shipments.findIndex((shipment) => shipment.id === action.payload.id);
        
        if (index !== -1) {
          state.shipments[index] = action.payload;
        }
        
        if (state.shipment && state.shipment.id === action.payload.id) {
          state.shipment = action.payload;
        }
      })
      .addCase(updateShipment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to update shipment' };
      })
      
      // deleteShipment
      .addCase(deleteShipment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteShipment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.shipments = state.shipments.filter((shipment) => shipment.id !== action.payload.id);
        state.pagination.count -= 1;
        
        if (state.shipment && state.shipment.id === action.payload.id) {
          state.shipment = null;
        }
      })
      .addCase(deleteShipment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to delete shipment' };
      })
      
      // fetchShipmentTracking
      .addCase(fetchShipmentTracking.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchShipmentTracking.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tracking[action.payload.id] = action.payload.tracking;
      })
      .addCase(fetchShipmentTracking.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch shipment tracking' };
      })
      
      // addTrackingUpdate
      .addCase(addTrackingUpdate.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addTrackingUpdate.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.tracking[action.payload.id]) {
          state.tracking[action.payload.id].push(action.payload.update);
        } else {
          state.tracking[action.payload.id] = [action.payload.update];
        }
      })
      .addCase(addTrackingUpdate.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to add tracking update' };
      })
      
      // fetchVehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch vehicles' };
      })
      
      // fetchDrivers
      .addCase(fetchDrivers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.drivers = action.payload;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch drivers' };
      });
  },
});

// Export actions and reducer
export const { resetShipmentStatus, clearCurrentShipment } = shipmentsSlice.actions;

// Selectors
export const selectAllShipments = (state) => state.shipments.shipments;
export const selectShipmentById = (state) => state.shipments.shipment;
export const selectShipmentTracking = (id) => (state) => state.shipments.tracking[id] || [];
export const selectVehicles = (state) => state.shipments.vehicles;
export const selectDrivers = (state) => state.shipments.drivers;
export const selectShipmentStatus = (state) => state.shipments.status;
export const selectShipmentError = (state) => state.shipments.error;
export const selectShipmentPagination = (state) => state.shipments.pagination;

export default shipmentsSlice.reducer;