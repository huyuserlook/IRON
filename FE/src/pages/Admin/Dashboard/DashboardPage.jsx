import { useEffect, useState } from "react";
import adminApi from "../../../api/adminApi";
import { formatCurrency } from "../../../utils/formatCurrency";
import {
  Bike,
  ShoppingBag,
  Users,
  TrendingUp,
  ChevronRight,
  Plus,
} from "lucide-react";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminApi
      .getStatistics()
      .then((res) => {
        const payload = res?.data ?? res;
        setStats(payload || null);
      })
      .catch(() => {});
  }, []);

  const cards = [
    {
      label: "Giá trị kho hàng",
      value: formatCurrency(
        stats?.totalInventoryValue || stats?.totalRevenue || 0,
      ),
      sub: stats?.inventoryChangeText || "+8.2% tháng này",
      color: "orange",
    },
    {
      label: "Tổng đơn vị xe",
      value: stats?.totalMotorcycles || 0,
      sub: `${stats?.totalModels || 0} Phân khúc`,
      color: "blue",
    },
    {
      label: "Tăng trưởng doanh số",
      value: `${stats?.growthPercent ?? 15.4}%`,
      sub: "Hàng tháng",
      color: "green",
    },
    {
      label: "Mục tiêu",
      value: `${stats?.targetProgress ?? 95}%`,
      sub: "Hoàn thành",
      color: "purple",
    },
  ];

  const colorMap = {
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
  };

  const recentOrders = stats?.recentOrders || [
    { id: 1, name: "Nguyễn Văn A", item: "NOMAD SCRAMBLER", amount: 15200 },
    { id: 2, name: "Trần Thị B", item: "STRATA SPORT RS", amount: 18500 },
  ];

  const inventory = stats?.inventory || [
    {
      id: 1,
      name: "STRATA SPORT RS",
      status: "CÒN HÀNG (12)",
      price: "$18,500",
      img: null,
    },
    {
      id: 2,
      name: "IGNIS RR 1000",
      status: "ĐÃ ĐẶT (2)",
      price: "$29,900",
      img: null,
    },
    {
      id: 3,
      name: "IRON VULCAN 1200",
      status: "CÒN HÀNG (5)",
      price: "$24,900",
      img: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-orange-500">
              Quản trị viên
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Hiệu suất Showroom
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Bảng điều khiển tổng quan giúp quản lý kho xe, doanh thu và đơn
              hàng một cách dễ dàng.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-3xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600">
            <Plus size={16} /> Thêm sản phẩm mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.9fr_1fr]">
        {/* Left / main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c, i) => (
              <div
                key={c.label}
                className="bg-white rounded-xl p-4 shadow-sm transform transition-all hover:shadow-xl hover:-translate-y-1"
                style={{ animation: `fadeUp 400ms ease ${i * 80}ms both` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">{c.label}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {c.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorMap[c.color]}`}
                  >
                    <span className="text-sm font-semibold">{c.sub}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Quản lý Kho xe</h3>
              <div className="flex items-center gap-2">
                <button className="text-sm px-3 py-1 border rounded-full text-gray-600">
                  Lọc Dòng Xe
                </button>
                <button className="text-sm px-3 py-1 bg-red-600 text-white rounded-full">
                  Xuất Báo Cáo
                </button>
              </div>
            </div>

            <div className="divide-y">
              {inventory.map((item, idx) => (
                <div key={item.id} className="py-3 flex items-center gap-4">
                  <div className="w-16 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                    IMG
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          2024 Model • 1200cc
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-800">
                          {item.price}
                        </div>
                        <div className="text-xs text-red-500 mt-1">
                          {item.status}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right / side */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-700">Đơn hàng mới nhất</h4>
              <a className="text-sm text-red-600 hover:underline flex items-center gap-1">
                XEM TẤT CẢ <ChevronRight size={14} />
              </a>
            </div>
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      {o.name.split(" ")[0][0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{o.name}</div>
                      <div className="text-xs text-gray-400">{o.item}</div>
                    </div>
                  </div>
                  <div className="text-sm text-red-600">
                    +${o.amount?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-700">Tăng trưởng</h4>
              <div className="text-sm text-gray-400">Tổng kết 6 tháng</div>
            </div>
            <div className="h-28 flex items-end">
              <svg
                className="w-full h-20"
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
              >
                <polyline
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  points="0,30 20,26 40,22 60,18 80,14 100,10"
                />
              </svg>
            </div>
            <div className="mt-3 text-sm text-red-600">
              +{stats?.growthPercent ?? 24.5}%
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default DashboardPage;
