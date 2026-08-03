import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bike,
  Tag,
  List,
  ShoppingBag,
  Calendar,
  Users,
  BarChart2,
} from "lucide-react";

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/motorcycles", label: "Quản lý xe", icon: Bike },
  { path: "/admin/brands", label: "Hãng xe", icon: Tag },
  { path: "/admin/categories", label: "Dòng xe", icon: List },
  { path: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
  { path: "/admin/bookings", label: "Lịch lái thử", icon: Calendar },
  { path: "/admin/users", label: "Người dùng", icon: Users },
  { path: "/admin/statistics", label: "Thống kê", icon: BarChart2 },
];

const AdminSidebar = ({ open }) => {
  const { pathname } = useLocation();

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-gray-900 text-white transition-all duration-300 z-20 ${open ? "w-64" : "w-16"}`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-gray-700">
        {open && (
          <span className="text-orange-400 font-bold text-lg tracking-wide">
            IRON ADMIN
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="mt-4 flex flex-col gap-1 px-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${active ? "bg-orange-500 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}
            >
              <Icon size={18} className="shrink-0" />
              {open && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
