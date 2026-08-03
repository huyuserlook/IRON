import { useCallback, useEffect, useState } from "react";
import userApi from "../../../api/userApi";
import { formatDate } from "../../../utils/formatDate";
import toast from "react-hot-toast";
import { UserCheck, UserX } from "lucide-react";

const UserManagement = () => {
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [page] = useState(0);

  const load = useCallback(() =>
    userApi
      .getAllAdmin({ page, size: 10 })
      .then((res) => setData(res.data || {})), [page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (id, name, enabled) => {
    if (!confirm(`${enabled ? "Khóa" : "Mở khóa"} tài khoản "${name}"?`))
      return;
    try {
      await userApi.toggleStatus(id);
      toast.success("Cập nhật thành công");
      load();
    } catch {
      toast.error("Thất bại");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Quản lý người dùng
      </h1>
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
            {data.content?.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{u.fullName}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-500">{u.phone || "—"}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === "ROLE_ADMIN" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {u.role === "ROLE_ADMIN" ? "Admin" : "User"}
                  </span>
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
                  <button
                    onClick={() => handleToggle(u.id, u.fullName, u.enabled)}
                    className={`p-1.5 rounded-lg transition-colors ${u.enabled ? "hover:bg-red-50 text-red-500" : "hover:bg-green-50 text-green-500"}`}
                  >
                    {u.enabled ? <UserX size={16} /> : <UserCheck size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
