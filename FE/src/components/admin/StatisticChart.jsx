import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "../../utils/formatCurrency";

const RevenueProfitLineChart = ({ data, exportRef }) => {
  const chartData = (data || []).map((item) => ({
    name: item.day && item.month && item.year
      ? `Ngay ${item.day}/${item.month}`
      : item.month && item.year
        ? `T${item.month}/${item.year}`
        : `${item.year}`,
    revenue: Number(item.revenue) || 0,
    profit: Number(item.profit) || 0,
    orderCount: Number(item.orderCount) || 0,
  }));

  return (
    <div ref={exportRef} className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="font-semibold text-gray-700 mb-4">
        Doanh thu va loi nhuan theo thoi gian
      </h2>
      {chartData.length === 0 ? (
        <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
          Chua co du lieu doanh thu
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
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
              formatter={(value, name) => {
                if (name === "Doanh thu" || name === "revenue") {
                  return [formatCurrency(value), "Doanh thu"];
                }
                if (name === "Loi nhuan" || name === "profit") {
                  return [formatCurrency(value), "Loi nhuan"];
                }
                return [value, name];
              }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #f0f0f0",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Doanh thu"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ fill: "#f97316", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              name="Loi nhuan"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

const TopMotorcyclesBarChart = ({ data, exportRef }) => {
  const chartData = (data || []).map((m, i) => ({
    name: m.motorcycleName || `Xe #${i + 1}`,
    sold: m.soldCount || 0,
    revenue: Number(m.revenue) || 0,
    profit: Number(m.profit) || 0,
  }));

  return (
    <div ref={exportRef} className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="font-semibold text-gray-700 mb-4">
        Top xe ban chay
      </h2>
      {chartData.length === 0 ? (
        <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
          Chua co du lieu ban hang
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
              angle={-15}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "So luong ban" || name === "sold") {
                  return [`${value} xe`, "So luong ban"];
                }
                return [formatCurrency(value), name];
              }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #f0f0f0",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              }}
            />
            <Legend />
            <Bar
              dataKey="sold"
              name="So luong ban"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

const StatisticChart = ({ stats, filterType, chartRefs }) => {
  if (!stats) {
    return null;
  }

  const chartData = filterType === "month" ? stats.dailyRevenues : stats.monthlyRevenues;
  const topMotorcycles = stats.topMotorcycles || [];

  return (
    <div className="space-y-6">
      <RevenueProfitLineChart data={chartData} exportRef={chartRefs?.line} />
      <TopMotorcyclesBarChart data={topMotorcycles} exportRef={chartRefs?.bar} />
    </div>
  );
};

export default StatisticChart;
