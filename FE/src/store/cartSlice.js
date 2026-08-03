import { createSlice } from "@reduxjs/toolkit";

const getInitialCart = () => {
  try {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem("cart", JSON.stringify(items));
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: getInitialCart(),
  },
  reducers: {
    addToCart: (state, action) => {
      const { motorcycleId, name, price, thumbnailUrl, colorName } =
        action.payload;
      const existing = state.items.find(
        (i) => i.motorcycleId === motorcycleId && i.colorName === colorName,
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({
          motorcycleId,
          name,
          price,
          thumbnailUrl,
          colorName,
          quantity: 1,
        });
      }
      saveCart(state.items);
    },
    removeFromCart: (state, action) => {
      const { motorcycleId, colorName } = action.payload;
      state.items = state.items.filter(
        (i) => !(i.motorcycleId === motorcycleId && i.colorName === colorName),
      );
      saveCart(state.items);
    },
    updateQuantity: (state, action) => {
      const { motorcycleId, colorName, quantity } = action.payload;
      const item = state.items.find(
        (i) => i.motorcycleId === motorcycleId && i.colorName === colorName,
      );
      if (item) {
        item.quantity = quantity;
        if (quantity <= 0) {
          state.items = state.items.filter(
            (i) =>
              !(i.motorcycleId === motorcycleId && i.colorName === colorName),
          );
        }
      }
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem("cart");
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

export default cartSlice.reducer;
