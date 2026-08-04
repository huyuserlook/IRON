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

  return {
    items,
    total,
    count,
    addItem: (item) => {
      try {
        // debug: log payload when attempting to add
        // eslint-disable-next-line no-console
        console.log("useCart.addItem dispatch", item);
        return dispatch(addToCart(item));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to dispatch addToCart", err);
        throw err;
      }
    },
    removeItem: (motorcycleId, colorName) =>
      dispatch(removeFromCart({ motorcycleId, colorName })),
    updateQty: (motorcycleId, colorName, quantity) =>
      dispatch(updateQuantity({ motorcycleId, colorName, quantity })),
    clear: () => dispatch(clearCart()),
  };
};
