import { useCallback, useEffect, useState } from "react";
import userApi from "../../../api/userApi";
import { formatDateTime } from "../../../utils/formatDate";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";

const PasswordResetManagement = () => {
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [page] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(
    () =>
      userApi.getPasswordResetRequests({ page, size: 10 }).then((res) => {
        const payload = res?.data ?? res;
        setData(payload || { content: [], totalPages: 0 });
      }),
    [page],
  );

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const handleApprove = async (id, fullName) => {
    if (!confirm(`Xác nhận cho phép "${fullName}" đặt lại mật khẩu?`)) return;
    setActionLoading(id);
    try {
      await userApi.approvePasswordReset(id);
      toast.success("Đã xác nhận yêu cầu đặt lại mật khẩu");
      load();
    } catch {
      toast.error("Không thể xác nhận yêu cầu");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (approved) => {
    if (approved === null || approved === undefined) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Chờ xác nhận</span>;
    }
    if (approved) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Đã xác nhận</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">Từ chối</span>;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Yêu cầu đặt lại mật khẩu
      </h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Người dùng</th>
              <th className="px-4 py-3 text-left">SĐT</th>
              <th className="px-4 py-3 text-center">Thời gian yêu cầu</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : data.content?.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  Không có yêu cầu đặt lại mật khẩu nào
                </td>
              </tr>
            ) : (
              data.content?.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{u.fullName}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.phone || "—"}</td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">
                    {formatDateTime(u.passwordResetRequestedAt)}
                  </td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(u.resetTokenApproved)}</td>
                  <td className="px-4 py-3 text-center">
                    {!u.resetTokenApproved && (
                      <button
                        onClick={() => handleApprove(u.id, u.fullName)}
                        disabled={actionLoading === u.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                      >
                        <ShieldCheck size={16} />
                        {actionLoading === u.id ? "Đang xử lý..." : "Duyệt"}
                      </button>
                    )}
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

export default PasswordResetManagement;
