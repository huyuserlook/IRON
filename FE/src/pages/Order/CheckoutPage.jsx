import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import orderApi from "../../api/orderApi";
import { formatCurrency } from "../../utils/formatCurrency";
import toast from "react-hot-toast";

const CheckoutPage = () => {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shippingAddress: user?.address || "",
    paymentMethod: "CASH",
    customerNote: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Giỏ hàng trống");
    setLoading(true);
    try {
      const orderData = {
        items: items.map((i) => ({
          motorcycleId: i.motorcycleId,
          colorName: i.colorName,
          quantity: i.quantity,
        })),
        shippingAddress: form.shippingAddress,
        paymentMethod: form.paymentMethod,
        customerNote: form.customerNote,
      };
      await orderApi.create(orderData);
      clear();
      toast.success("Đặt hàng thành công!");
      navigate(`/my-orders`);
    } catch (err) {
      toast.error(err.message || "Đặt hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Xác nhận đơn hàng
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-700 mb-4">
              Thông tin giao hàng
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ nhận xe *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.shippingAddress}
                  onChange={(e) =>
                    setForm({ ...form, shippingAddress: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phương thức thanh toán
                </label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) =>
                    setForm({ ...form, paymentMethod: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="CASH">Tiền mặt</option>
                  <option value="BANK_TRANSFER">Chuyển khoản</option>
                  <option value="MOMO">MoMo</option>
                  <option value="VNPAY">VNPay</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  rows={2}
                  value={form.customerNote}
                  onChange={(e) =>
                    setForm({ ...form, customerNote: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading
              ? "Đang đặt hàng..."
              : `Đặt hàng — ${formatCurrency(total)}`}
          </button>
        </form>

        {/* Order summary */}
        <div className="bg-white rounded-xl shadow-sm p-5 h-fit">
          <h2 className="font-semibold text-gray-700 mb-4">
            Đơn hàng ({items.length} xe)
          </h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div
                key={`${item.motorcycleId}-${item.colorName}`}
                className="flex justify-between text-sm"
              >
                <div>
                  <p className="font-medium text-gray-700 line-clamp-1">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    x{item.quantity} {item.colorName && `· ${item.colorName}`}
                  </p>
                </div>
                <p className="font-semibold text-gray-700">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-orange-600">
            <span>Tổng cộng</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
