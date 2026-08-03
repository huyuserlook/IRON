import { useEffect, useState } from "react";
import adminApi from "../../../api/adminApi";
import { formatCurrency } from "../../../utils/formatCurrency";
import { Bike, ShoppingBag, Users, TrendingUp } from "lucide-react";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminApi
      .getStatistics()
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  const cards = [
    {
      label: "Doanh thu",
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: TrendingUp,
      color: "orange",
    },
    {
      label: "Đơn hàng",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: "blue",
    },
    {
      label: "Khách hàng",
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: "green",
    },
    {
      label: "Tổng xe",
      value: stats?.totalMotorcycles || 0,
      icon: Bike,
      color: "purple",
    },
  ];

  const colorMap = {
    orange: "bg-orange-100 text-orange-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}
            >
              <Icon size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-2">
          Chào mừng đến trang quản trị
        </h2>
        <p className="text-sm text-gray-500">
          Sử dụng menu bên trái để quản lý xe, hãng, dòng xe, đơn hàng và người
          dùng.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
