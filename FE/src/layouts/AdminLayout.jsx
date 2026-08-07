import { Outlet } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import AdminSidebar from "../components/layout/Sidebar";
import { useAuth } from "../hooks/useAuth";
import notificationApi from "../api/notificationApi";
import { Menu, LogOut, Bell, Star, Home, ShoppingCart, Calendar, Mail, Users, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifCount, setNotifCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const notifRef = useRef(null);
  const { user, handleLogout } = useAuth();

  const loadNewCount = () => {
    notificationApi
      .getCount()
      .then((res) => {
        const payload = res?.data ?? res;
        setNotifCount(Number(payload) || 0);
      })
      .catch(() => setNotifCount(0));
  };

  const loadNotifications = (silent = false) => {
    if (!silent) setLoadingNotif(true);
    notificationApi
      .getRecent(20)
      .then((res) => {
        const payload = res?.data ?? res;
        setNotifications(Array.isArray(payload) ? payload : []);
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoadingNotif(false));
  };

  useEffect(() => {
    loadNewCount();
    const interval = setInterval(() => {
      loadNewCount();
      if (notifOpen) loadNotifications(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [notifOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const toggleNotif = () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next) {
      setRefreshing(true);
      loadNewCount();
      loadNotifications();
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      <AdminSidebar open={sidebarOpen} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-72 md:ml-64 sm:ml-20" : "lg:ml-20 md:ml-20 sm:ml-20"}`}
      >
        {/* Admin Header */}
        <header className="bg-white/95 backdrop-blur-md shadow-sm h-20 flex items-center justify-between px-6 sticky top-0 z-10 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-600 hover:text-slate-900"
            >
              <Menu size={22} />
            </button>
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Home size={16} /> Trang chủ
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative" ref={notifRef}>
              <button
                onClick={toggleNotif}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Thông báo mới"
                title="Thông báo mới"
              >
                <Bell size={18} className={refreshing ? "animate-spin" : ""} />
                {notifCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {notifCount}
                  </span>
                ) : null}
              </button>

              {notifOpen ? (
                <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <Bell size={16} className="text-red-500" />
                      Thông báo mới (24h)
                    </div>
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                      {notifCount}
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotif ? (
                      <div className="px-4 py-6 text-center text-sm text-slate-400">
                        Đang tải...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-slate-400">
                        Chưa có thông báo mới nào.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={`${n.type}-${n.title}-${n.createdAt}`}
                          to={n.link || "#"}
                          onClick={() => setNotifOpen(false)}
                          className="block border-b border-slate-50 px-4 py-3 transition hover:bg-slate-50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="shrink-0 pt-0.5">
                              {n.type === "ORDER" ? (
                                <ShoppingCart size={16} className="text-blue-500" />
                              ) : n.type === "BOOKING" ? (
                                <Calendar size={16} className="text-purple-500" />
                              ) : n.type === "CONTACT" ? (
                                <Mail size={16} className="text-green-500" />
                              ) : n.type === "REVIEW" ? (
                                <Star size={16} className="text-amber-400" />
                              ) : n.type === "USER" ? (
                                <Users size={16} className="text-slate-600" />
                              ) : n.type === "PASSWORD_RESET" ? (
                                <ShieldCheck size={16} className="text-orange-500" />
                              ) : (
                                <Bell size={16} className="text-slate-500" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {n.title}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {n.message}
                              </p>
                            </div>
                            <span className="shrink-0 text-[11px] text-slate-400">
                              {formatTime(n.createdAt)}
                            </span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  <Link
                    to="/admin"
                    onClick={() => setNotifOpen(false)}
                    className="block border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-red-600 transition hover:bg-slate-100"
                  >
                    Xem tất cả thông báo
                  </Link>
                </div>
              ) : null}
            </div>
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-slate-700">
                {user?.fullName}
              </span>
              <span className="text-xs text-slate-500">Quản trị viên</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto py-6">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
