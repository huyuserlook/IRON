import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectCartTotal,
  selectCartCount,
} from "../store/cartSlice";

export const useCart = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);

  const updateQty = useCallback((motorcycleId, colorName, quantity) => {
    dispatch(updateQuantity({ motorcycleId, colorName, quantity }));
  }, [dispatch]);

  return {
    items,
    total,
    count,
    addItem: (item) => {
      try {
        console.log("useCart.addItem dispatch", item);
        return dispatch(addToCart(item));
      } catch (err) {
        console.error("Failed to dispatch addToCart", err);
        throw err;
      }
    },
    removeItem: (motorcycleId, colorName) =>
      dispatch(removeFromCart({ motorcycleId, colorName })),
    updateQty,
    clear: () => dispatch(clearCart()),
  };
};
