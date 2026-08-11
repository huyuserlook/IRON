import { Outlet } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "../components/layout/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { Menu, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

const StaffLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, handleLogout } = useAuth();

  return (
    <div className="min-h-screen flex bg-slate-100">
      <AdminSidebar open={sidebarOpen} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-72 md:ml-64 sm:ml-20" : "lg:ml-20 md:ml-20 sm:ml-20"}`}
      >
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
              Trang chủ
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-slate-700">
                {user?.fullName}
              </span>
              <span className="text-xs text-slate-500">Nhân viên</span>
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

export default StaffLayout;
