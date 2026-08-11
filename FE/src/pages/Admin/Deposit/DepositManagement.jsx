import { useCallback, useEffect, useState } from "react";
import depositApi from "../../../api/depositApi";
import { formatDate } from "../../../utils/formatDate";
import { formatCurrency } from "../../../utils/formatCurrency";
import toast from "react-hot-toast";
import { X, Check, RefreshCw, Filter } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "DEPOSITED", label: "Đã đặt cọc" },
  { value: "COMPLETED", label: "Đã hoàn tất" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "REFUNDED", label: "Hoàn cọc" },
];

const STATUS_BADGE = {
  PENDING: "bg-gray-100 text-gray-700",
  DEPOSITED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-blue-100 text-blue-700",
};

const PAYMENT_METHOD_BADGE = {
  CASH: "bg-emerald-50 text-emerald-700",
  PAYOS: "bg-blue-50 text-blue-700",
};

const DepositManagement = () => {
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(
    () =>
      depositApi.getAll({ page, size: 10, status: statusFilter || undefined })
        .then((res) => {
          const payload = res?.data ?? res;
          setData(payload || { content: [], totalPages: 0 });
        }),
    [page, statusFilter],
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdateStatus = async (id, currentStatus, newStatus) => {
    if (!confirm(`Cập nhật trạng thái từ ${currentStatus} sang ${newStatus}?`)) return;
    try {
      await depositApi.updateStatus(id, newStatus, `Admin cập nhật trạng thái`);
      toast.success("Cập nhật thành công");
      load();
    } catch {
      toast.error("Thất bại");
    }
  };

  const handleRefund = async (id) => {
    const note = prompt("Nhập lý do hoàn cọc:");
    if (note === null) return;
    try {
      await depositApi.refund(id, note);
      toast.success("Hoàn cọc thành công");
      load();
    } catch {
      toast.error("Không thể hoàn cọc");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý đặt cọc</h1>
          <p className="text-sm text-gray-600 mt-1">Theo dõi và xử lý các đơn đặt cọc giữ xe</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter size={16} />
          <span>Lọc theo trạng thái:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Mã đơn</th>
              <th className="px-4 py-3 text-left">Khách hàng</th>
              <th className="px-4 py-3 text-right">Tổng tiền</th>
              <th className="px-4 py-3 text-right">Đã cọc</th>
              <th className="px-4 py-3 text-right">Còn lại</th>
              <th className="px-4 py-3 text-center">Phương thức</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center">Hạn thanh toán</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.content?.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                  Chưa có đơn đặt cọc nào
                </td>
              </tr>
            ) : (
              data.content?.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">#{d.orderCode}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{d.userName}</p>
                    <p className="text-xs text-gray-400">{d.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(d.totalAmount)}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-semibold">{formatCurrency(d.depositAmount)}</td>
                  <td className="px-4 py-3 text-right text-orange-600 font-semibold">{formatCurrency(d.remainingAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${PAYMENT_METHOD_BADGE[d.paymentMethod] || "bg-gray-100 text-gray-600"}`}>
                      {d.paymentMethod === "PAYOS" ? "Chuyển khoản" : d.paymentMethod === "CASH" ? "Tiền mặt" : (d.paymentMethod || "-")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[d.status] || "bg-gray-100 text-gray-600"}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">
                    {formatDate(d.deadlineDate)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {d.status === "DEPOSITED" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(d.id, d.status, "COMPLETED")}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-500"
                            title="Xác nhận đã thanh toán"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(d.id, d.status, "CANCELLED")}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                            title="Hủy đơn"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      {(d.status === "PENDING" || d.status === "DEPOSITED") && (
                        <button
                          onClick={() => handleRefund(d.id)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"
                          title="Hoàn cọc"
                        >
                          <RefreshCw size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepositManagement;
