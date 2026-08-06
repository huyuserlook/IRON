import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Label,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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

const MONTH_COLORS = ["#f97316", "#ea580c", "#6366f1"];

const MonthlyRevenueChart = ({ data }) => {
  const chartData = (data || []).map((m) => ({
    name: `T${m.month}/${m.year}`,
    revenue: Number(m.revenue) || 0,
    orderCount: Number(m.orderCount) || 0,
  }));

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="font-semibold text-gray-700 mb-4">
        Doanh thu theo tháng
      </h2>
      {chartData.length === 0 ? (
        <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
          Chưa có dữ liệu doanh thu tháng
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={380}>
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <Tooltip
              formatter={(v, name) => [formatCurrency(v), name]}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #f0f0f0",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              }}
            />
            <Pie
              data={chartData}
              dataKey="revenue"
              nameKey="name"
              cx="50%"
              cy="48%"
              innerRadius={80}
              outerRadius={130}
              paddingAngle={2}
              cornerRadius={6}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={MONTH_COLORS[index % MONTH_COLORS.length]}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
              <Label
                content={() => (
                  <g textAnchor="middle">
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      fill="#6b7280"
                      fontSize={12}
                    >
                      Tổng cộng
                    </text>
                    <text
                      x="50%"
                      y="68%"
                      textAnchor="middle"
                      fill="#111827"
                      fontSize={18}
                      fontWeight="bold"
                    >
                      {formatCurrency(totalRevenue)}
                    </text>
                  </g>
                )}
              />
            </Pie>
            <Legend
              verticalAlign="bottom"
              align="center"
              height={36}
              iconSize={10}
              iconRadius={4}
              layout="horizontal"
              wrapperStyle={{ fontSize: 11, color: "#6b7280" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

const YEAR_COLORS = ["#10b981", "#f97316", "#ef4444"];

const YearlyRevenueChart = ({ data }) => {
  const chartData = (data || []).map((y) => ({
    name: `${y.year}`,
    revenue: Number(y.revenue) || 0,
    orderCount: Number(y.orderCount) || 0,
  }));

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="font-semibold text-gray-700 mb-4">
        Doanh thu theo năm
      </h2>
      {chartData.length === 0 ? (
        <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
          Chưa có dữ liệu doanh thu năm
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={360}>
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <Tooltip
              formatter={(v, name) => [formatCurrency(v), name]}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #f0f0f0",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              }}
            />
            <Pie
              data={chartData}
              dataKey="revenue"
              nameKey="name"
              cx="50%"
              cy="48%"
              innerRadius={70}
              outerRadius={120}
              paddingAngle={3}
              cornerRadius={6}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={YEAR_COLORS[index % YEAR_COLORS.length]}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
              <Label
                content={() => (
                  <g textAnchor="middle">
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      fill="#6b7280"
                      fontSize={12}
                    >
                      Tổng cộng
                    </text>
                    <text
                      x="50%"
                      y="68%"
                      textAnchor="middle"
                      fill="#111827"
                      fontSize={18}
                      fontWeight="bold"
                    >
                      {formatCurrency(totalRevenue)}
                    </text>
                  </g>
                )}
              />
            </Pie>
            <Legend
              verticalAlign="bottom"
              align="center"
              height={36}
              iconSize={10}
              iconRadius={4}
              layout="horizontal"
              wrapperStyle={{ fontSize: 11, color: "#6b7280" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

const StatisticChart = ({ stats, type = "all" }) => {
  if (!stats) {
    return null;
  }

  const showMonthly = type === "all" || type === "monthly";
  const showYearly = type === "all" || type === "yearly";
  const showBikes = type === "all" || type === "bikes";

  return (
    <div className="space-y-6">
      {showMonthly && <MonthlyRevenueChart data={stats.monthlyRevenues} />}
      {showYearly && <YearlyRevenueChart data={stats.yearlyRevenues} />}
      {showBikes && <SalesByBikeChart data={stats.topMotorcycles} />}
    </div>
  );
};

export default StatisticChart;
