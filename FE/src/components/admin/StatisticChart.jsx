import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../utils/formatCurrency";

const SalesByBikeChart = ({ data }) => {
  const chartData = (data || []).map((m, i) => ({
    name: m.motorcycleName || `Xe #${i + 1}`,
    sold: m.soldCount,
    revenue: Number(m.revenue) || 0,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="font-semibold text-gray-700 mb-4">
        Top xe bán chạy
      </h2>
      {chartData.length === 0 ? (
        <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
          Chưa có dữ liệu bán hàng
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#374151" }}
              axisLine={{ stroke: "#d1d5db" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              width={70}
              tickFormatter={(v) => (v / 1e6).toFixed(0) + "M"}
            />
            <Tooltip
              formatter={(v) => formatCurrency(v)}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #f0f0f0",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              }}
            />
            <Bar
              dataKey="revenue"
              name="Doanh thu"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

const StatisticChart = ({ stats }) => {
  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      <SalesByBikeChart data={stats.topMotorcycles} />
    </div>
  );
};

export default StatisticChart;
