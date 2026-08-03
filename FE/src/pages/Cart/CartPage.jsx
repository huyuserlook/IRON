import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/formatCurrency";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";

const CartPage = () => {
  const { items, total, removeItem, updateQty } = useCart();

  if (items.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <ShoppingCart size={56} className="mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-4">Giỏ hàng trống</p>
        <Link
          to="/motorcycles"
          className="bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
        >
          Xem xe ngay
        </Link>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Giỏ hàng ({items.length} xe)
      </h1>
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div
            key={`${item.motorcycleId}-${item.colorName}`}
            className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
          >
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt={item.name}
                className="w-20 h-16 object-cover rounded-lg"
              />
            ) : (
              <div className="w-20 h-16 bg-gray-100 rounded-lg" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
              {item.colorName && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Màu: {item.colorName}
                </p>
              )}
              <p className="text-orange-600 font-bold text-sm mt-1">
                {formatCurrency(item.price)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateQty(
                    item.motorcycleId,
                    item.colorName,
                    item.quantity - 1,
                  )
                }
                className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Minus size={12} />
              </button>
              <span className="w-8 text-center text-sm font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  updateQty(
                    item.motorcycleId,
                    item.colorName,
                    item.quantity + 1,
                  )
                }
                className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
            <p className="w-28 text-right font-bold text-gray-700 text-sm">
              {formatCurrency(item.price * item.quantity)}
            </p>
            <button
              onClick={() => removeItem(item.motorcycleId, item.colorName)}
              className="text-red-400 hover:text-red-600 transition-colors ml-2"
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Tổng cộng</p>
          <p className="text-2xl font-extrabold text-orange-600">
            {formatCurrency(total)}
          </p>
        </div>
        <Link
          to="/checkout"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Đặt hàng
        </Link>
      </div>
    </div>
  );
};

export default CartPage;
