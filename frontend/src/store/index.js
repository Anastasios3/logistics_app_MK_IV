import { configureStore } from '@reduxjs/toolkit';
import ordersReducer from './slices/ordersSlice';
import productsReducer from './slices/productsSlice';
import shipmentsReducer from './slices/shipmentsSlice';
import customersReducer from './slices/customersSlice';
import suppliersReducer from './slices/suppliersSlice';
import dashboardReducer from './slices/dashboardSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    orders: ordersReducer,
    products: productsReducer,
    shipments: shipmentsReducer,
    customers: customersReducer,
    suppliers: suppliersReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredActions: ['orders/uploadFile/fulfilled'],
        ignoredPaths: ['orders.files'],
      },
    }),
});

export default store;