import { Link, useLocation } from "react-router-dom";
import IronLogo from "../common/IronLogo";
import {
  LayoutDashboard,
  Bike,
  Tag,
  List,
  ShoppingBag,
  Calendar,
  Users,
  BarChart2,
  Star,
  Home,
  MessageSquare,
  ShieldCheck,
  Wallet,
  FileText,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const ADMIN_NAV_ITEMS = [
  { path: "/", label: "Trang chủ", icon: Home, exact: true },
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/motorcycles", label: "Quản lý xe", icon: Bike },
  { path: "/admin/brands", label: "Hãng xe", icon: Tag },
  { path: "/admin/categories", label: "Dòng xe", icon: List },
  { path: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
  { path: "/admin/bookings", label: "Lịch lái thử", icon: Calendar },
  { path: "/admin/users", label: "Người dùng", icon: Users },
  { path: "/admin/deposits", label: "Đặt cọc", icon: Wallet },
  { path: "/admin/installment-requests", label: "Trả góp", icon: FileText },
  { path: "/admin/password-reset-requests", label: "Yêu cầu đổi MK", icon: ShieldCheck },
  { path: "/admin/reviews", label: "Đánh giá", icon: Star },
  { path: "/admin/contacts", label: "Liên hệ", icon: MessageSquare },
  { path: "/admin/statistics", label: "Thống kê", icon: BarChart2 },
];

const STAFF_NAV_ITEMS = [
  { path: "/", label: "Trang chủ", icon: Home, exact: true },
  { path: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/staff/orders", label: "Đơn hàng", icon: ShoppingBag },
  { path: "/staff/bookings", label: "Lịch lái thử", icon: Calendar },
  { path: "/staff/motorcycles", label: "Xe máy", icon: Bike },
  { path: "/staff/installment-requests", label: "Trả góp", icon: FileText },
];

const AdminSidebar = ({ open }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const isAdmin = user?.role === "ROLE_ADMIN";
  const isStaff = user?.role === "ROLE_STAFF";
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : isStaff ? STAFF_NAV_ITEMS : [];

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-slate-950 text-white transition-all duration-300 z-20 flex flex-col ${open ? "md:w-64 lg:w-72 w-20" : "w-20"}`}
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-4 border-b border-white/10">
        <div className="flex items-center gap-3 w-full">
          <IronLogo
            size={open ? "md" : "sm"}
            asLink={false}
            hideText={true}
            className="!gap-2"
          />
          {open && (
            <div className="hidden sm:flex flex-col space-y-1">
              <p className="text-lg font-semibold tracking-wide text-white">
                {isAdmin ? "IRON ADMIN" : "IRON STAFF"}
              </p>
              <p className="text-xs text-slate-400">
                {isAdmin ? "Quản lý showroom" : "Khu vực nhân viên"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-4 flex-1 flex flex-col gap-2 overflow-y-auto px-2">
        {navItems.map(({ path, label, icon: Icon, exact }) => {
          const active = exact ? pathname === path : pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              title={label}
              className={`group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm transition-all duration-200 ${
                active
                  ? "bg-orange-500 text-white shadow-lg"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${active ? "bg-white/15 text-white" : "bg-slate-900 text-slate-300 group-hover:bg-white/10 group-hover:text-white"}`}
              >
                <Icon size={18} />
              </span>
              {open && (
                <span className="hidden sm:inline font-medium">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
