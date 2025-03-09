import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ordersReducer, {
  fetchOrders,
  fetchOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  resetOrderStatus,
  clearCurrentOrder,
  selectAllOrders,
  selectOrderById,
  selectOrderStatus,
  selectOrderError,
  selectOrderPagination
} from '../slices/ordersSlice';
import { orderService } from '../../services/api';

// Mock the API service
jest.mock('../../services/api', () => ({
  orderService: {
    getOrders: jest.fn(),
    getOrderById: jest.fn(),
    createOrder: jest.fn(),
    updateOrder: jest.fn(),
    deleteOrder: jest.fn(),
    getOrderStatistics: jest.fn()
  }
}));

// Configure mock store
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Orders Slice', () => {
  // Test initial state
  describe('Initial State', () => {
    it('should return the initial state', () => {
      expect(ordersReducer(undefined, { type: undefined })).toEqual({
        orders: [],
        order: null,
        statistics: null,
        status: 'idle',
        error: null,
        pagination: {
          count: 0,
          next: null,
          previous: null,
        }
      });
    });
  });
  
  // Test reducers
  describe('Reducers', () => {
    it('should handle resetOrderStatus', () => {
      const initialState = {
        orders: [],
        order: null,
        statistics: null,
        status: 'failed',
        error: { message: 'Error message' },
        pagination: {
          count: 0,
          next: null,
          previous: null,
        }
      };
      
      expect(ordersReducer(initialState, resetOrderStatus())).toEqual({
        ...initialState,
        status: 'idle',
        error: null
      });
    });
    
    it('should handle clearCurrentOrder', () => {
      const initialState = {
        orders: [],
        order: { id: '1', order_number: 'ORD-001' },
        statistics: null,
        status: 'idle',
        error: null,
        pagination: {
          count: 0,
          next: null,
          previous: null,
        }
      };
      
      expect(ordersReducer(initialState, clearCurrentOrder())).toEqual({
        ...initialState,
        order: null
      });
    });
  });
  
  // Test async thunks
  describe('Async Thunks', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    
    describe('fetchOrders', () => {
      it('should fetch orders and fulfill when successful', async () => {
        // Mock API response
        const mockOrdersResponse = {
          count: 2,
          next: null,
          previous: null,
          results: [
            { id: '1', order_number: 'ORD-001' },
            { id: '2', order_number: 'ORD-002' }
          ]
        };
        
        orderService.getOrders.mockResolvedValueOnce(mockOrdersResponse);
        
        // Setup mock store
        const store = mockStore({
          orders: {
            orders: [],
            status: 'idle',
            error: null,
            pagination: {
              count: 0,
              next: null,
              previous: null,
            }
          }
        });
        
        // Expected actions
        const expectedActions = [
          { type: fetchOrders.pending.type },
          { 
            type: fetchOrders.fulfilled.type,
            payload: mockOrdersResponse
          }
        ];
        
        // Dispatch the action
        await store.dispatch(fetchOrders({}));
        
        // Check that the correct actions were dispatched
        const actions = store.getActions();
        expect(actions[0].type).toBe(expectedActions[0].type);
        expect(actions[1].type).toBe(expectedActions[1].type);
        expect(actions[1].payload).toEqual(mockOrdersResponse);
        
        // Verify the API was called correctly
        expect(orderService.getOrders).toHaveBeenCalledWith({});
      });
      
      it('should handle errors when fetching orders fails', async () => {
        // Mock API error
        const errorMessage = 'Network error';
        const error = new Error(errorMessage);
        error.response = { data: { message: errorMessage } };
        
        orderService.getOrders.mockRejectedValueOnce(error);
        
        // Setup mock store
        const store = mockStore({
          orders: {
            orders: [],
            status: 'idle',
            error: null,
            pagination: {
              count: 0,
              next: null,
              previous: null,
            }
          }
        });
        
        // Expected actions
        const expectedActions = [
          { type: fetchOrders.pending.type },
          { 
            type: fetchOrders.rejected.type,
            payload: { message: errorMessage }
          }
        ];
        
        // Dispatch the action
        await store.dispatch(fetchOrders({}));
        
        // Check that the correct actions were dispatched
        const actions = store.getActions();
        expect(actions[0].type).toBe(expectedActions[0].type);
        expect(actions[1].type).toBe(expectedActions[1].type);
        expect(actions[1].payload).toEqual({ message: errorMessage });
        
        // Verify the API was called correctly
        expect(orderService.getOrders).toHaveBeenCalledWith({});
      });
    });
    
    describe('fetchOrderById', () => {
      it('should fetch a single order and fulfill when successful', async () => {
        // Mock API response
        const mockOrderResponse = {
          id: '1',
          order_number: 'ORD-001',
          status: 'pending',
          items: [
            { id: '1', product: { name: 'Test Product' }, quantity: 1 }
          ]
        };
        
        orderService.getOrderById.mockResolvedValueOnce(mockOrderResponse);
        
        // Setup mock store
        const store = mockStore({
          orders: {
            order: null,
            status: 'idle',
            error: null,
          }
        });
        
        // Expected actions
        const expectedActions = [
          { type: fetchOrderById.pending.type },
          { 
            type: fetchOrderById.fulfilled.type,
            payload: mockOrderResponse
          }
        ];
        
        // Dispatch the action
        await store.dispatch(fetchOrderById('1'));
        
        // Check that the correct actions were dispatched
        const actions = store.getActions();
        expect(actions[0].type).toBe(expectedActions[0].type);
        expect(actions[1].type).toBe(expectedActions[1].type);
        expect(actions[1].payload).toEqual(mockOrderResponse);
        
        // Verify the API was called correctly
        expect(orderService.getOrderById).toHaveBeenCalledWith('1');
      });
    });
    
    describe('createOrder', () => {
      it('should create an order and fulfill when successful', async () => {
        // Mock API response
        const mockCreatedOrder = {
          id: '1',
          order_number: 'ORD-001',
          status: 'pending',
          total_amount: '29.99'
        };
        
        orderService.createOrder.mockResolvedValueOnce(mockCreatedOrder);
        
        // Order data to create
        const orderData = {
          customer_id: '1',
          items: [{ product_id: '1', quantity: 1 }],
          shipping_address: '123 Test St'
        };
        
        // Setup mock store
        const store = mockStore({
          orders: {
            orders: [],
            status: 'idle',
            error: null,
          }
        });
        
        // Expected actions
        const expectedActions = [
          { type: createOrder.pending.type },
          { 
            type: createOrder.fulfilled.type,
            payload: mockCreatedOrder
          }
        ];
        
        // Dispatch the action
        await store.dispatch(createOrder(orderData));
        
        // Check that the correct actions were dispatched
        const actions = store.getActions();
        expect(actions[0].type).toBe(expectedActions[0].type);
        expect(actions[1].type).toBe(expectedActions[1].type);
        expect(actions[1].payload).toEqual(mockCreatedOrder);
        
        // Verify the API was called correctly
        expect(orderService.createOrder).toHaveBeenCalledWith(orderData);
      });
    });
  });
  
  // Test selectors
  describe('Selectors', () => {
    it('should select all orders', () => {
      const orders = [{ id: '1' }, { id: '2' }];
      const state = { orders: { orders } };
      
      expect(selectAllOrders(state)).toBe(orders);
    });
    
    it('should select order by id', () => {
      const order = { id: '1' };
      const state = { orders: { order } };
      
      expect(selectOrderById(state)).toBe(order);
    });
    
    it('should select order status', () => {
      const status = 'loading';
      const state = { orders: { status } };
      
      expect(selectOrderStatus(state)).toBe(status);
    });
    
    it('should select order error', () => {
      const error = { message: 'Error message' };
      const state = { orders: { error } };
      
      expect(selectOrderError(state)).toBe(error);
    });
    
    it('should select order pagination', () => {
      const pagination = { count: 10, next: '/orders/?page=2', previous: null };
      const state = { orders: { pagination } };
      
      expect(selectOrderPagination(state)).toBe(pagination);
    });
  });
});