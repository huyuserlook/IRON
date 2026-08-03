import { useEffect, useState } from "react";
import orderApi from "../../api/orderApi";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";
import { ORDER_STATUS } from "../../utils/constants";
import toast from "react-hot-toast";

const OrderHistoryPage = () => {
  const [data, setData] = useState({ content: [] });
  const load = () =>
    orderApi
      .getMyOrders({ page: 0, size: 20 })
      .then((res) => setData(res.data || {}));
  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    try {
      await orderApi.cancel(id);
      toast.success("Đã hủy đơn hàng");
      load();
    } catch {
      toast.error("Không thể hủy đơn hàng này");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Đơn hàng của tôi
      </h1>
      {data.content?.length === 0 ? (
        <p className="text-gray-500 text-center py-10">Chưa có đơn hàng nào</p>
      ) : (
        <div className="space-y-4">
          {data.content?.map((order) => {
            const st = ORDER_STATUS[order.status] || {};
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-mono text-orange-600 font-semibold">
                      {order.orderCode}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold bg-${st.color}-100 text-${st.color}-700`}
                  >
                    {st.label}
                  </span>
                </div>
                <div className="space-y-2 mb-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.motorcycleName}{" "}
                        {item.colorName && `(${item.colorName})`} x
                        {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="font-bold text-orange-600">
                    {formatCurrency(order.totalAmount)}
                  </span>
                  {order.status === "PENDING" && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="text-sm text-red-500 hover:text-red-700 transition-colors"
                    >
                      Hủy đơn
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
