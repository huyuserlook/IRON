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
    addItem: (item) => dispatch(addToCart(item)),
    removeItem: (motorcycleId, colorName) =>
      dispatch(removeFromCart({ motorcycleId, colorName })),
    updateQty: (motorcycleId, colorName, quantity) =>
      dispatch(updateQuantity({ motorcycleId, colorName, quantity })),
    clear: () => dispatch(clearCart()),
  };
};
