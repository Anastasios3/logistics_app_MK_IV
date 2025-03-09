import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportService } from '../../services/api';

// Async thunks
export const fetchSalesReport = createAsyncThunk(
  'reports/fetchSalesReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.getSalesReport(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchInventoryReport = createAsyncThunk(
  'reports/fetchInventoryReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.getInventoryReport(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchShipmentsReport = createAsyncThunk(
  'reports/fetchShipmentsReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.getShipmentsReport(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const exportReport = createAsyncThunk(
  'reports/exportReport',
  async ({ reportType, params }, { rejectWithValue }) => {
    try {
      const response = await reportService.exportReport(reportType, params);
      return { reportType, success: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Initial state
const initialState = {
  salesReport: null,
  inventoryReport: null,
  shipmentsReport: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  exportStatus: {
    sales: 'idle',
    inventory: 'idle',
    shipments: 'idle',
  },
};

// Slice
const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    resetReportStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    resetExportStatus: (state) => {
      state.exportStatus = {
        sales: 'idle',
        inventory: 'idle',
        shipments: 'idle',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSalesReport
      .addCase(fetchSalesReport.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.salesReport = action.payload;
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch sales report' };
      })
      
      // fetchInventoryReport
      .addCase(fetchInventoryReport.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchInventoryReport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.inventoryReport = action.payload;
      })
      .addCase(fetchInventoryReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch inventory report' };
      })
      
      // fetchShipmentsReport
      .addCase(fetchShipmentsReport.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchShipmentsReport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.shipmentsReport = action.payload;
      })
      .addCase(fetchShipmentsReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch shipments report' };
      })
      
      // exportReport
      .addCase(exportReport.pending, (state, action) => {
        const reportType = action.meta.arg.reportType;
        state.exportStatus[reportType] = 'loading';
      })
      .addCase(exportReport.fulfilled, (state, action) => {
        const reportType = action.payload.reportType;
        state.exportStatus[reportType] = 'succeeded';
      })
      .addCase(exportReport.rejected, (state, action) => {
        const reportType = action.meta.arg.reportType;
        state.exportStatus[reportType] = 'failed';
        state.error = action.payload || { message: `Failed to export ${reportType} report` };
      });
  },
});

// Export actions and reducer
export const { resetReportStatus, resetExportStatus } = reportsSlice.actions;

// Selectors
export const selectSalesReport = (state) => state.reports.salesReport;
export const selectInventoryReport = (state) => state.reports.inventoryReport;
export const selectShipmentsReport = (state) => state.reports.shipmentsReport;
export const selectReportStatus = (state) => state.reports.status;
export const selectExportStatus = (reportType) => (state) => 
  state.reports.exportStatus[reportType] || 'idle';
export const selectReportError = (state) => state.reports.error;

export default reportsSlice.reducer;