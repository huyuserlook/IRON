import { useCallback, useEffect, useState } from "react";
import userApi from "../../../api/userApi";
import { formatDate } from "../../../utils/formatDate";
import toast from "react-hot-toast";
import { UserCheck, UserX, Trash2, ShieldCheck, Filter } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "", label: "Tất cả vai trò" },
  { value: "ROLE_ADMIN", label: "Admin" },
  { value: "ROLE_STAFF", label: "Nhân viên" },
  { value: "ROLE_USER", label: "Khách hàng" },
];

const ROLE_BADGE = {
  ROLE_ADMIN: "bg-red-100 text-red-700",
  ROLE_STAFF: "bg-blue-100 text-blue-700",
  ROLE_USER: "bg-gray-100 text-gray-600",
};

const ROLE_LABEL = {
  ROLE_ADMIN: "Admin",
  ROLE_STAFF: "Nhân viên",
  ROLE_USER: "Khách hàng",
};

const UserManagement = () => {
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const load = useCallback(
    () =>
      userApi.getAllAdmin({ page, size: 10, role: roleFilter || undefined }).then((res) => {
        const payload = res?.data ?? res;
        setData(payload || { content: [], totalPages: 0 });
      }),
    [page, roleFilter],
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    userApi.getProfile().then((res) => {
      const payload = res?.data ?? res;
      setCurrentUser(payload);
    }).catch(() => {});
  }, []);

  const handleToggle = async (id, name, enabled) => {
    if (!confirm(`${enabled ? "Khóa" : "Mở khóa"} tài khoản "${name}"?`)) return;
    try {
      await userApi.toggleStatus(id);
      toast.success("Cập nhật thành công");
      load();
    } catch {
      toast.error("Thất bại");
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Xóa vĩnh viễn tài khoản "${name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await userApi.delete(id);
      toast.success("Đã xóa người dùng");
      load();
    } catch {
      toast.error("Không thể xóa người dùng");
    }
  };

  const handleRoleChange = async (userId, userName, newRole) => {
    const user = data.content.find((u) => u.id === userId);
    if (!user) return;

    if (currentUser?.id === userId) {
      toast.error("Bạn không thể thay đổi vai trò của chính mình");
      return;
    }

    const oldRole = user.role;
    if (oldRole === newRole) {
      toast.error("Vai trò mới giống vai trò hiện tại");
      return;
    }

    const confirmed = confirm(
      `Thay đổi vai trò của "${userName}" từ ${ROLE_LABEL[oldRole] || oldRole} sang ${ROLE_LABEL[newRole] || newRole}?`
    );
    if (!confirmed) return;

    try {
      await userApi.updateRole(userId, newRole, `Admin thay đổi vai trò từ ${oldRole} sang ${newRole}`);
      toast.success("Đã cập nhật vai trò");
      load();
    } catch {
      toast.error("Không thể cập nhật vai trò");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
          <p className="text-sm text-gray-600 mt-1">Phân quyền và quản lý tài khoản trong hệ thống</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter size={16} />
          <span>Lọc theo vai trò:</span>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(0);
          }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Người dùng</th>
              <th className="px-4 py-3 text-left">SĐT</th>
              <th className="px-4 py-3 text-center">Vai trò</th>
              <th className="px-4 py-3 text-center">Ngày tạo</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.content?.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  Chưa có người dùng nào
                </td>
              </tr>
            ) : (
              data.content?.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${ROLE_BADGE[u.role] || ROLE_BADGE.ROLE_USER}`}>
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{u.fullName}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.phone || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, u.fullName, e.target.value)}
                      disabled={currentUser?.id === u.id}
                      className={`rounded-full px-3 py-1 text-xs font-medium border-0 cursor-pointer ${ROLE_BADGE[u.role] || ROLE_BADGE.ROLE_USER} ${currentUser?.id === u.id ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {ROLE_OPTIONS.filter((opt) => opt.value).map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${u.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                    >
                      {u.enabled ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleToggle(u.id, u.fullName, u.enabled)}
                        className={`p-1.5 rounded-lg transition-colors ${u.enabled ? "hover:bg-red-50 text-red-500" : "hover:bg-green-50 text-green-500"}`}
                      >
                        {u.enabled ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.fullName)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
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
      </div>
    </div>
  );
};

export default UserManagement;
