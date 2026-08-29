import { useCallback, useEffect, useState } from "react";
import userApi from "../../../api/userApi";
import { formatDate } from "../../../utils/formatDate";
import toast from "react-hot-toast";
import { UserCheck, UserX, Trash2, Plus, ShieldCheck } from "lucide-react";

const StaffManagement = () => {
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [page] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });

  const load = useCallback(
    () =>
      userApi.getStaff({ page, size: 10 }).then((res) => {
        const payload = res?.data ?? res;
        setData(payload || { content: [], totalPages: 0 });
      }),
    [page],
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await userApi.createStaff(form);
      toast.success("Tạo nhân viên thành công");
      setForm({ fullName: "", email: "", password: "", phone: "" });
      setShowForm(false);
      load();
    } catch {
      toast.error("Không thể tạo nhân viên");
    }
  };

  const handleToggle = async (id, name, enabled) => {
    if (!confirm(`${enabled ? "Khóa" : "Mở khóa"} tài khoản "${name}"?`))
      return;
    try {
      await userApi.toggleStaffStatus(id);
      toast.success("Cập nhật thành công");
      load();
    } catch {
      toast.error("Thất bại");
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Xóa vĩnh viễn tài khoản "${name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await userApi.deleteStaff(id);
      toast.success("Đã xóa nhân viên");
      load();
    } catch {
      toast.error("Không thể xóa nhân viên");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý nhân viên</h1>
          <p className="text-sm text-gray-600 mt-1">Thêm, sửa, vô hiệu hóa tài khoản nhân viên</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
        >
          <Plus size={16} />
          Thêm nhân viên
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Thông tin nhân viên mới</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu tạm</label>
              <input
                type="text"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                placeholder="Ít nhất 8 ký tự"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                placeholder="0905xxxxxx"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Tạo nhân viên
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Nhân viên</th>
              <th className="px-4 py-3 text-left">SĐT</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center">Ngày tạo</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.content?.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  Chưa có nhân viên nào
                </td>
              </tr>
            ) : (
              data.content?.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
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
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${u.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                    >
                      {u.enabled ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">
                    {formatDate(u.createdAt)}
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

export default StaffManagement;
