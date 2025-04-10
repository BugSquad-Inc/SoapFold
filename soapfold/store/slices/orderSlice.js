import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentOrder: null,
  orders: [],
  cart: [],
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
    addToCart: (state, action) => {
      state.cart.push(action.payload);
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter(item => item.id !== action.payload);
    },
    updateCartItem: (state, action) => {
      const index = state.cart.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.cart[index] = action.payload;
      }
    },
    clearCart: (state) => {
      state.cart = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCurrentOrder,
  setOrders,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  setLoading,
  setError,
} = orderSlice.actions;

export default orderSlice.reducer; 