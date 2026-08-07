import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  CalendarClock,
  Settings,
  Heart,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import userApi from "../../api/userApi";
import { useAuth } from "../../hooks/useAuth";

const UserProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      console.log("[Profile] token:", token ? token.slice(0, 20) + "..." : "MISSING");
      try {
        const res = await userApi.getProfile();
        console.log("[Profile] response:", res);
        const payload = res?.data ?? res;
        setProfile(payload || {});
      } catch (err) {
        console.error("[Profile] error:", err);
        toast.error("Không thể tải thông tin tài khoản");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayUser = profile || user;

  return (
    <div className="min-h-screen bg-[#F7F5FA] pb-16 text-[#1A1B1F]">
      <style>{`
        @keyframes profileRise {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .profile-rise {
          animation: profileRise 0.72s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .profile-rise { animation: none !important; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>

      <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <header className="profile-rise mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#BC000A]">
            Tài khoản
          </p>
          <h1 className="mt-2 font-teko text-[clamp(2.4rem,5vw,3.4rem)] font-bold leading-none tracking-[-0.03em]">
            Trang cá nhân
          </h1>
          <p className="mt-3 text-sm leading-7 text-[#7A6E71]">
            Quản lý thông tin cá nhân và theo dõi hoạt động của bạn.
          </p>
        </header>

        {loading ? (
          <div className="space-y-6">
            <div className="h-48 animate-pulse rounded-[24px] bg-white" />
            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-[20px] bg-white" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <article
              className="profile-rise overflow-hidden rounded-[24px] border border-[#E3DEE6] bg-white shadow-[0_16px_40px_-32px_rgba(0,0,0,0.14)]"
              style={{ animationDelay: "0ms" }}
            >
              <div className="relative h-32 bg-gradient-to-r from-[#BC000A] to-[#94000D]" />
              <div className="px-6 pb-6 sm:px-8">
                <div className="relative -mt-16 mb-4 inline-flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
                  {displayUser?.avatarUrl ? (
                    <img
                      src={displayUser.avatarUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#FAF8FC] text-[#BC000A]">
                      <User size={48} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <h2 className="font-teko text-[2rem] font-bold leading-none tracking-[-0.02em]">
                      {displayUser?.fullName || "Người dùng"}
                    </h2>
                    {displayUser?.role && (
                      <span className="mt-1 inline-flex rounded-full bg-[#BC000A]/10 px-3 py-1 text-xs font-semibold text-[#BC000A]">
                        {displayUser.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm text-[#7A6E71]">
                      <Mail size={15} className="text-[#BC000A]" />
                      {displayUser?.email || "—"}
                    </div>
                    {displayUser?.phone && (
                      <div className="flex items-center gap-2 text-sm text-[#7A6E71]">
                        <Phone size={15} className="text-[#BC000A]" />
                        {displayUser.phone}
                      </div>
                    )}
                    {displayUser?.address && (
                      <div className="flex items-center gap-2 text-sm text-[#7A6E71]">
                        <MapPin size={15} className="text-[#BC000A]" />
                        {displayUser.address}
                      </div>
                    )}
                    {displayUser?.createdAt && (
                      <div className="flex items-center gap-2 text-sm text-[#7A6E71]">
                        <Calendar size={15} className="text-[#BC000A]" />
                        Tham gia từ {new Date(displayUser.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-3">
              <Link
                to="/my-orders"
                className="profile-rise group flex items-center gap-4 rounded-[20px] border border-[#E3DEE6] bg-white p-5 shadow-[0_16px_40px_-32px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_-30px_rgba(0,0,0,0.18)]"
                style={{ animationDelay: "100ms" }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#BC000A]/10 text-[#BC000A] transition-transform duration-300 group-hover:scale-110">
                  <Package size={22} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="font-teko text-lg font-bold leading-none">Đơn hàng</p>
                  <p className="mt-1 text-xs text-[#7A6E71]">Xem lịch sử mua xe</p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-[#7A6E71] transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                to="/my-bookings"
                className="profile-rise group flex items-center gap-4 rounded-[20px] border border-[#E3DEE6] bg-white p-5 shadow-[0_16px_40px_-32px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_-30px_rgba(0,0,0,0.18)]"
                style={{ animationDelay: "180ms" }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#BC000A]/10 text-[#BC000A] transition-transform duration-300 group-hover:scale-110">
                  <CalendarClock size={22} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="font-teko text-lg font-bold leading-none">Lái thử</p>
                  <p className="mt-1 text-xs text-[#7A6E71]">Lịch sử đặt lái thử</p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-[#7A6E71] transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                to="/profile/settings"
                className="profile-rise group flex items-center gap-4 rounded-[20px] border border-[#E3DEE6] bg-white p-5 shadow-[0_16px_40px_-32px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_-30px_rgba(0,0,0,0.18)]"
                style={{ animationDelay: "260ms" }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#BC000A]/10 text-[#BC000A] transition-transform duration-300 group-hover:scale-110">
                  <Settings size={22} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="font-teko text-lg font-bold leading-none">Cài đặt tài khoản</p>
                  <p className="mt-1 text-xs text-[#7A6E71]">Thay đổi thông tin cá nhân</p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-[#7A6E71] transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            <article
              className="profile-rise overflow-hidden rounded-[24px] border border-[#E3DEE6] bg-white shadow-[0_16px_40px_-32px_rgba(0,0,0,0.14)]"
              style={{ animationDelay: "320ms" }}
            >
              <div className="border-b border-[#EEEAF1] px-6 py-4 sm:px-8">
                <h3 className="font-teko text-xl font-bold">Hoạt động gần đây</h3>
              </div>
              <div className="space-y-3 px-6 py-4 sm:px-8">
                <div className="flex items-start gap-3 rounded-[12px] bg-[#FAF8FC] px-4 py-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#BC000A]">
                    <Heart size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1A1B1F]">
                      Yêu thích & danh sách
                    </p>
                    <p className="mt-0.5 text-xs text-[#7A6E71]">
                      Xem các xe bạn đã quan tâm
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
