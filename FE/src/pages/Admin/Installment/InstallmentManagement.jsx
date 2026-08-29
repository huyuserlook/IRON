import { useCallback, useEffect, useState } from "react";
import installmentApi from "../../../api/installmentApi";
import { formatDate } from "../../../utils/formatDate";
import { formatCurrency } from "../../../utils/formatCurrency";
import toast from "react-hot-toast";
import { Filter, Trash2, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "REVIEWING", label: "Đang duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
];

const STATUS_BADGE = {
  PENDING: "bg-gray-100 text-gray-700",
  REVIEWING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const MONTHLY_INCOME_LABEL = {
  UNDER_5M: "Dưới 5 triệu",
  BETWEEN_5M_10M: "5 - 10 triệu",
  BETWEEN_10M_20M: "10 - 20 triệu",
  ABOVE_20M: "Trên 20 triệu",
};

const InstallmentManagement = () => {
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    () =>
      installmentApi
        .getAll({ status: statusFilter || undefined, page, size: 10 })
        .then((res) => {
          const payload = res?.data ?? res;
          setData(payload || { content: [], totalPages: 0 });
        })
        .catch(() => setData({ content: [], totalPages: 0 })),
    [page, statusFilter],
  );

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (id) => {
    setLoading(true);
    try {
      const res = await installmentApi.getDetail(id);
      const payload = res?.data ?? res;
      setDetail(payload);
      setSelectedId(id);
    } catch {
      toast.error("Không thể tải chi tiết");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const note = prompt(`Nhập ghi chú cập nhật trạng thái sang ${newStatus}:`);
    if (note === null) return;
    try {
      await installmentApi.updateStatus(id, newStatus, note);
      toast.success("Cập nhật thành công");
      load();
      if (selectedId === id) {
        openDetail(id);
      }
    } catch {
      toast.error("Thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa yêu cầu trả góp này?")) return;
    try {
      await installmentApi.delete(id);
      toast.success("Xóa thành công");
      load();
      if (selectedId === id) {
        setSelectedId(null);
        setDetail(null);
      }
    } catch {
      toast.error("Không thể xóa");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý yêu cầu trả góp</h1>
          <p className="text-sm text-gray-600 mt-1">Theo dõi và xử lý các yêu cầu trả góp của khách hàng</p>
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
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Khách hàng</th>
                <th className="px-4 py-3 text-left">Xe</th>
                <th className="px-4 py-3 text-center">Thu nhập</th>
                <th className="px-4 py-3 text-right">Trả trước</th>
                <th className="px-4 py-3 text-center">Tháng</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.content?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    Chưa có yêu cầu trả góp nào
                  </td>
                </tr>
              ) : (
                data.content?.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => openDetail(item.id)}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedId === item.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{item.fullName}</p>
                      <p className="text-xs text-gray-400">{item.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{item.motorcycleName}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {MONTHLY_INCOME_LABEL[item.monthlyIncome] || item.monthlyIncome}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(item.downPayment)}
                    </td>
                    <td className="px-4 py-3 text-center">{item.installmentMonths}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[item.status] || "bg-gray-100 text-gray-600"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {(item.status === "PENDING" || item.status === "REVIEWING") && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(item.id, "APPROVED"); }}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-green-500"
                              title="Duyệt"
                            >
                              ✓
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(item.id, "REJECTED"); }}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                              title="Từ chối"
                            >
                              ✕
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-sm text-gray-600">Trang {page + 1} / {data.totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                disabled={page >= data.totalPages - 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </div>

        {selectedId && (
          <div className="rounded-xl border border-[#E3DEE6] bg-white p-6 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Chi tiết yêu cầu</h3>
              <button onClick={() => { setSelectedId(null); setDetail(null); }} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-gray-500">Đang tải...</p>
            ) : detail ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Khách hàng</p>
                  <p className="font-semibold text-gray-800">{detail.fullName}</p>
                  <p className="text-xs text-gray-500">{detail.phone} · {detail.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Xe muốn mua</p>
                  <p className="font-semibold text-gray-800">{detail.motorcycleName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">CMND/CCCD</p>
                  <p className="font-mono text-gray-800">{detail.idCardNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Thu nhập</p>
                  <p className="text-gray-800">{MONTHLY_INCOME_LABEL[detail.monthlyIncome] || detail.monthlyIncome}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Trả trước</p>
                    <p className="font-semibold text-gray-800">{formatCurrency(detail.downPayment)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Số tháng</p>
                    <p className="font-semibold text-gray-800">{detail.installmentMonths}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Trạng thái</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[detail.status] || "bg-gray-100 text-gray-600"}`}>
                    {detail.status}
                  </span>
                </div>
                {detail.adminNote && (
                  <div>
                    <p className="text-xs text-gray-500">Ghi chú xử lý</p>
                    <p className="text-gray-800">{detail.adminNote}</p>
                  </div>
                )}
                {detail.customerNote && (
                  <div>
                    <p className="text-xs text-gray-500">Ghi chú khách</p>
                    <p className="text-gray-800">{detail.customerNote}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">Thời gian tạo</p>
                  <p className="text-gray-800">{formatDate(detail.createdAt)}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chọn một yêu cầu để xem chi tiết</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallmentManagement;
