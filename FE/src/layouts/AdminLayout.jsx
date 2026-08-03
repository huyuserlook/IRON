import { Outlet } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "../components/layout/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { Menu, LogOut, User } from "lucide-react";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, handleLogout } = useAuth();

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar open={sidebarOpen} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}
      >
        {/* Admin Header */}
        <header className="bg-white shadow-sm h-14 flex items-center justify-between px-6 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-3">
            <User size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {user?.fullName}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 ml-2"
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
