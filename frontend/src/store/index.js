import { configureStore } from '@reduxjs/toolkit';
import ordersReducer from './slices/ordersSlice';
import inventoryReducer from './slices/inventorySlice';
import shipmentsReducer from './slices/shipmentsSlice';
import customersReducer from './slices/customersSlice';
import suppliersReducer from './slices/suppliersSlice';
import reportsReducer from './slices/reportsSlice';

const store = configureStore({
  reducer: {
    orders: ordersReducer,
    inventory: inventoryReducer,
    shipments: shipmentsReducer,
    customers: customersReducer,
    suppliers: suppliersReducer,
    reports: reportsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredActions: ['orders/uploadFile/fulfilled', 'inventory/uploadImage/fulfilled'],
        ignoredPaths: ['orders.files', 'inventory.images'],
      },
    }),
});

export default store;