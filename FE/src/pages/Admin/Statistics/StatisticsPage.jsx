import { useEffect, useState } from "react";
import adminApi from "../../../api/adminApi";
import { formatCurrency } from "../../../utils/formatCurrency";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const StatisticsPage = () => {
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

  const chartData =
    stats?.monthlyRevenues?.map((m) => ({
      name: `T${m.month}/${m.year}`,
      revenue: m.revenue,
      orders: m.orderCount,
    })) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Thống kê doanh thu
      </h1>

      {/* Monthly chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">
          Doanh thu theo tháng
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => (v / 1e6).toFixed(0) + "M"}
            />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Bar
              dataKey="revenue"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
              name="Doanh thu"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top motorcycles */}
      {stats?.topMotorcycles?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Top xe bán chạy</h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Xe</th>
                <th className="px-4 py-3 text-center">Đã bán</th>
                <th className="px-4 py-3 text-right">Doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.topMotorcycles.map((m, i) => (
                <tr key={m.motorcycleId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    {m.thumbnailUrl && (
                      <img
                        src={m.thumbnailUrl}
                        alt=""
                        className="w-10 h-8 object-cover rounded"
                      />
                    )}
                    <span className="font-medium text-gray-800">
                      {m.motorcycleName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {m.soldCount} xe
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-orange-600">
                    {formatCurrency(m.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StatisticsPage;
