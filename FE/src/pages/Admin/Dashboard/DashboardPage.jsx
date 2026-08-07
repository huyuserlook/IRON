import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminApi from "../../../api/adminApi";
import motorcycleApi from "../../../api/motorcycleApi";
import orderApi from "../../../api/orderApi";
import { formatCurrency } from "../../../utils/formatCurrency";
import { ChevronRight, Package } from "lucide-react";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, ordersRes, motoRes] = await Promise.all([
          adminApi.getStatistics(),
          orderApi.getAllAdmin({ page: 0, size: 5 }),
          motorcycleApi.search({ page: 0, size: 3, sortBy: "createdAt", sortDir: "desc" }),
        ]);

        if (!alive) return;

        const statsPayload = statsRes?.data ?? statsRes;
        setStats(statsPayload || null);

        const ordersPayload = ordersRes?.data ?? ordersRes;
        const ordersList = Array.isArray(ordersPayload)
          ? ordersPayload
          : ordersPayload?.content || ordersPayload?.recentOrders || [];
        setRecentOrders(Array.isArray(ordersList) ? ordersList.slice(0, 5) : []);

        const motoPayload = motoRes?.data ?? motoRes;
        const motoList = Array.isArray(motoPayload)
          ? motoPayload
          : motoPayload?.content || [];
        setInventory(Array.isArray(motoList) ? motoList.slice(0, 3) : []);
      } catch {
        // silent
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  const cards = stats
    ? [
        {
          label: "Tổng doanh thu",
          value: formatCurrency(stats.totalRevenue || 0),
          sub: "Doanh thu",
          color: "orange",
        },
        {
          label: "Tổng đơn hàng",
          value: stats.totalOrders || 0,
          sub: "Đơn hàng",
          color: "blue",
        },
        {
          label: "Tổng khách hàng",
          value: stats.totalCustomers || 0,
          sub: "Khách hàng",
          color: "green",
        },
        {
          label: "Tổng số xe",
          value: stats.totalMotorcycles || 0,
          sub: "Xe trong kho",
          color: "purple",
        },
      ]
    : [];

  const colorMap = {
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
  };

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
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.9fr_1fr]">
        {/* Left / main */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-4 shadow-sm animate-pulse"
                  style={{ animation: `fadeUp 400ms ease ${i * 80}ms both` }}
                >
                  <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
                  <div className="h-8 w-32 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
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
          )}

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Quản lý Kho xe</h3>
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/motorcycles"
                  className="text-sm px-3 py-1 border rounded-full text-gray-600 hover:border-gray-300"
                >
                  Lọc Dòng Xe
                </Link>
                <button className="text-sm px-3 py-1 bg-red-600 text-white rounded-full hover:bg-red-700">
                  Xuất Báo Cáo
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-md animate-pulse" />
                ))}
              </div>
            ) : inventory.length > 0 ? (
              <div className="divide-y">
                {inventory.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-4">
                    <div className="w-16 h-12 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center text-gray-400">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-800">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {item.brandName || ""} {item.engineCc ? `• ${item.engineCc}cc` : ""}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-800">
                            {formatCurrency(item.price)}
                          </div>
                          <div className="text-xs text-red-500 mt-1">
                            {item.status === "AVAILABLE"
                              ? `Còn hàng (${item.totalInventory ?? 0})`
                              : item.status === "OUT_OF_STOCK"
                                ? "Hết hàng"
                                : item.status === "COMING_SOON"
                                  ? "Sắp ra mắt"
                                  : item.status === "DISCONTINUED"
                                    ? "Ngừng SX"
                                    : item.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">
                Chưa có xe trong kho
              </p>
            )}
          </div>
        </div>

        {/* Right / side */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-700">Đơn hàng mới nhất</h4>
              <Link
                to="/admin/orders"
                className="text-sm text-red-600 hover:underline flex items-center gap-1"
              >
                XEM TẤT CẢ <ChevronRight size={14} />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        {(o.customerName || o.userName || o.name || "U")
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 1)
                          .join("")}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {o.customerName || o.userName || o.name || "Khách hàng"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {o.motorcycleName || o.item || "Xe"}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-red-600">
                      +{formatCurrency(o.totalAmount || o.amount || 0)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                Chưa có đơn hàng
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-700">Tăng trưởng</h4>
              <div className="text-sm text-gray-400">Tổng kết 6 tháng</div>
            </div>
            {stats?.monthlyRevenues?.length > 0 ? (
              <div className="h-28 flex items-end">
                <svg
                  className="w-full h-20"
                  viewBox="0 0 100 40"
                  preserveAspectRatio="none"
                >
                  {(() => {
                    const data = stats.monthlyRevenues.slice(-6);
                    const max = Math.max(...data.map((m) => Number(m.revenue) || 0), 1);
                    const points = data
                      .map((m, i) => {
                        const x = i * (100 / Math.max(data.length - 1, 1));
                        const y = 30 - (Number(m.revenue) / max) * 30;
                        return `${x},${Math.max(0, y)}`;
                      })
                      .join(" ");
                    return (
                      <polyline
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        points={points}
                      />
                    );
                  })()}
                </svg>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">
                Chưa có dữ liệu doanh thu
              </p>
            )}
            <div className="mt-3 text-sm text-red-600">
              {stats?.monthlyRevenues?.length > 0
                ? `+${stats.growthPercent ?? 0}%`
                : "+0%"}
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
