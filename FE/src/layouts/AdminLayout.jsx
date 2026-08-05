import { Outlet } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import AdminSidebar from "../components/layout/Sidebar";
import { useAuth } from "../hooks/useAuth";
import reviewApi from "../api/reviewApi";
import { Menu, LogOut, Bell, Star, MessageSquare, Home } from "lucide-react";
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
  const [newReviewCount, setNewReviewCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifReviews, setNotifReviews] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const notifRef = useRef(null);
  const { user, handleLogout } = useAuth();

  const loadNewCount = () => {
    reviewApi
      .getNewCount()
      .then((res) => {
        const payload = res?.data ?? res;
        setNewReviewCount(Number(payload) || 0);
      })
      .catch(() => setNewReviewCount(0));
  };

  const loadNewReviews = (silent = false) => {
    if (!silent) setLoadingNotif(true);
    reviewApi
      .getNew(20)
      .then((res) => {
        const payload = res?.data ?? res;
        setNotifReviews(Array.isArray(payload) ? payload : []);
      })
      .catch(() => setNotifReviews([]))
      .finally(() => setLoadingNotif(false));
  };

  useEffect(() => {
    loadNewCount();
    const interval = setInterval(() => {
      loadNewCount();
      if (notifOpen) loadNewReviews(true);
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      loadNewReviews();
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
                aria-label="Thông báo đánh giá mới"
                title="Thông báo đánh giá mới"
              >
                <Bell size={18} className={refreshing ? "animate-spin" : ""} />
                {newReviewCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {newReviewCount}
                  </span>
                ) : null}
              </button>

              {notifOpen ? (
                <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <MessageSquare size={16} className="text-red-500" />
                      Đánh giá mới (24h)
                    </div>
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                      {newReviewCount}
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotif ? (
                      <div className="px-4 py-6 text-center text-sm text-slate-400">
                        Đang tải...
                      </div>
                    ) : notifReviews.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-slate-400">
                        Chưa có đánh giá mới nào.
                      </div>
                    ) : (
                      notifReviews.map((review) => (
                        <Link
                          key={review.id}
                          to="/admin/reviews"
                          onClick={() => setNotifOpen(false)}
                          className="block border-b border-slate-50 px-4 py-3 transition hover:bg-slate-50"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {review.customerName || "Khách hàng"}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {review.motorcycleName || "Sản phẩm"}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    size={11}
                                    className={
                                      i < (review.rating || 0)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-300"
                                    }
                                  />
                                ))}
                              </div>
                              <p className="mt-1 text-[11px] text-slate-400">
                                {formatTime(review.createdAt)}
                              </p>
                            </div>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                            {review.comment}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                  <Link
                    to="/admin/reviews"
                    onClick={() => setNotifOpen(false)}
                    className="block border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-red-600 transition hover:bg-slate-100"
                  >
                    Xem tất cả đánh giá
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
