import { useCallback, useEffect, useState } from "react";
import orderApi from "../../../api/orderApi";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDateTime } from "../../../utils/formatDate";
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from "../../../utils/constants";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

const STATUSES = [
  "",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPING",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

const OrderManagement = () => {
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(() => {
    orderApi
      .getAllAdmin({ status: status || undefined, page, size: 10 })
      .then((res) => {
        const payload = res?.data ?? res;
        setData(payload || { content: [], totalPages: 0 });
      });
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (id, newStatus) => {
    try {
      await orderApi.updateStatus(id, newStatus);
      toast.success("Cập nhật trạng thái thành công");
      load();
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;
    setDeletingId(id);
    try {
      await orderApi.deleteOrder(id);
      toast.success("Xóa đơn hàng thành công");
      load();
    } catch {
      toast.error("Xóa đơn hàng thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  const renderPayment = (order) => {
    const method = order.paymentMethod;
    const paymentStatus = order.paymentStatus;

    const methodLabel = method ? PAYMENT_METHOD[method] || method : "Chưa xác định";
    const statusInfo = paymentStatus ? PAYMENT_STATUS[paymentStatus] : null;
    const statusLabel = statusInfo ? statusInfo.label : "Chưa xác định";
    const statusColor = statusInfo ? statusInfo.color : "gray";

    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-700">{methodLabel}</p>
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-${statusColor}-100 text-${statusColor}-700`}
        >
          {statusLabel}
        </span>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Quản lý đơn hàng
      </h1>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex gap-3 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(0);
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border
              ${status === s ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}
          >
            {s ? ORDER_STATUS[s]?.label : "Tất cả"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Mã đơn</th>
              <th className="px-4 py-3 text-left">Khách hàng</th>
              <th className="px-4 py-3 text-right">Tổng tiền</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-left">Thanh toán</th>
              <th className="px-4 py-3 text-left">Ngày đặt</th>
              <th className="px-4 py-3 text-center">Cập nhật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.content?.map((order) => {
              const st = ORDER_STATUS[order.status] || {};
              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium text-orange-600">
                    {order.orderCode}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.customerEmail}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium bg-${st.color}-100 text-${st.color}-700`}
                    >
                      {st.label || order.status}
                    </span>
                  </td>
                   <td className="px-4 py-3">
                    {renderPayment(order)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {formatDateTime(order.createdAt)}
                  </td>
                   <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatus(order.id, e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-orange-300"
                      >
                        {STATUSES.filter(Boolean).map((s) => (
                          <option key={s} value={s}>
                            {ORDER_STATUS[s]?.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDelete(order.id)}
                        disabled={deletingId === order.id}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Xóa đơn hàng"
                      >
                        {deletingId === order.id ? (
                          <svg
                            className="h-4 w-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M8 12a4 4 0 018 0H8z"
                            />
                          </svg>
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </td>
               </tr>
              );
            })}
          </tbody>
        </table>
        {data.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            {Array.from({ length: data.totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-8 h-8 rounded-lg text-sm ${i === page ? "bg-orange-500 text-white" : "hover:bg-gray-100 text-gray-600"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
