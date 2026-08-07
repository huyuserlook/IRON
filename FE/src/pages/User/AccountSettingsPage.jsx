import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Save,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import userApi from "../../api/userApi";
import { useAuth } from "../../hooks/useAuth";

const AccountSettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await userApi.getProfile();
        const payload = res?.data ?? res;
        const data = payload || {};
        setProfile(data);
        setForm({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
        });
      } catch {
        toast.error("Không thể tải thông tin tài khoản");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error("Vui lòng nhập đầy đủ họ tên và email");
      return;
    }

    setSubmitting(true);
    try {
      const res = await userApi.updateProfile(form);
      const payload = res?.data ?? res;
      const updated = payload?.data || payload;
      setProfile(updated);
      updateUser(updated);
      toast.success("Cập nhật thông tin thành công");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "Cập nhật thất bại",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const displayUser = profile || user;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5FA] pb-16 text-[#1A1B1F]">
        <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="h-48 animate-pulse rounded-[24px] bg-white" />
          <div className="mt-6 h-80 animate-pulse rounded-[24px] bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5FA] pb-16 text-[#1A1B1F]">
      <style>{`
        @keyframes settingsRise {
          0% { opacity: 0; transform: translateY(22px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .settings-rise {
          animation: settingsRise 0.72s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .settings-rise { animation: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <header className="settings-rise mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5E3F3B] transition-colors hover:text-[#BC000A]"
          >
            <ArrowLeft size={16} />
            Quay lại trang cá nhân
          </Link>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#BC000A]">
            Tài khoản
          </p>
          <h1 className="mt-2 font-teko text-[clamp(2.4rem,5vw,3.4rem)] font-bold leading-none tracking-[-0.03em]">
            Cài đặt tài khoản
          </h1>
          <p className="mt-3 text-sm leading-7 text-[#7A6E71]">
            Cập nhật thông tin cá nhân của bạn.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <article
            className="settings-rise overflow-hidden rounded-[24px] border border-[#E3DEE6] bg-white shadow-[0_16px_40px_-32px_rgba(0,0,0,0.14)]"
            style={{ animationDelay: "0ms" }}
          >
            <div className="relative h-28 bg-gradient-to-r from-[#BC000A] to-[#94000D]" />
            <div className="px-6 pb-6 sm:px-8">
              <div className="relative -mt-14 mb-4 inline-flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
                {displayUser?.avatarUrl ? (
                  <img
                    src={displayUser.avatarUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#FAF8FC] text-[#BC000A]">
                    <User size={40} strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h2 className="font-teko text-2xl font-bold leading-none">
                  {displayUser?.fullName || "Người dùng"}
                </h2>
                {displayUser?.role && (
                  <span className="inline-flex rounded-full bg-[#BC000A]/10 px-3 py-1 text-xs font-semibold text-[#BC000A]">
                    {displayUser.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
                  </span>
                )}
                <p className="text-xs text-[#7A6E71]">
                  Tham gia từ{" "}
                  {displayUser?.createdAt
                    ? new Date(displayUser.createdAt).toLocaleDateString(
                        "vi-VN",
                      )
                    : "—"}
                </p>
              </div>
            </div>
          </article>

          <article
            className="settings-rise overflow-hidden rounded-[24px] border border-[#E3DEE6] bg-white shadow-[0_16px_40px_-32px_rgba(0,0,0,0.14)]"
            style={{ animationDelay: "120ms" }}
          >
            <div className="border-b border-[#EEEAF1] px-6 py-4 sm:px-8">
              <h3 className="font-teko text-xl font-bold">Thông tin cá nhân</h3>
              <p className="mt-1 text-xs text-[#7A6E71]">
                Các thay đổi sẽ được lưu ngay lập tức.
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-6 py-6 sm:px-8"
            >
              <label className="block space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5E3F3B]">
                  Họ và tên
                </span>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BC000A]"
                  />
                  <input
                    required
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full rounded-[10px] border border-[#E3DEE6] bg-white pl-10 pr-4 py-3 text-sm outline-none transition-colors focus:border-[#BC000A]"
                    placeholder="Nhập họ tên"
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5E3F3B]">
                  Email
                </span>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BC000A]"
                  />
                  <input
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-[10px] border border-[#E3DEE6] bg-white pl-10 pr-4 py-3 text-sm outline-none transition-colors focus:border-[#BC000A]"
                    placeholder="Nhập email"
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5E3F3B]">
                  Số điện thoại
                </span>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BC000A]"
                  />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-[10px] border border-[#E3DEE6] bg-white pl-10 pr-4 py-3 text-sm outline-none transition-colors focus:border-[#BC000A]"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5E3F3B]">
                  Địa chỉ
                </span>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BC000A]"
                  />
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full rounded-[10px] border border-[#E3DEE6] bg-white pl-10 pr-4 py-3 text-sm outline-none transition-colors focus:border-[#BC000A]"
                    placeholder="Nhập địa chỉ"
                  />
                </div>
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 rounded-[8px] border border-[#E3DEE6] px-5 py-3 text-sm font-semibold text-[#5E3F3B] transition-colors hover:border-[#BC000A] hover:text-[#BC000A]"
                >
                  Hủy
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-[8px] bg-[#BC000A] px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </article>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
