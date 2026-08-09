import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import adminApi from "../../../api/adminApi";
import StatisticChart from "../../../components/admin/StatisticChart";
import { formatCurrency } from "../../../utils/formatCurrency";
import {
  FileSpreadsheet,
  FileText,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => currentYear - i);
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

const StatisticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(null);
  const [filterType, setFilterType] = useState("year");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);

  const chartRefs = {
    line: lineChartRef,
    bar: barChartRef,
  };

  const loadStats = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (filterType === "year" && selectedYear) {
      params.type = "year";
      params.year = selectedYear;
    } else if (filterType === "month" && selectedYear && selectedMonth) {
      params.type = "month";
      params.year = selectedYear;
      params.month = selectedMonth;
    }

    adminApi
      .getStatistics(params)
      .then((res) => {
        const payload = res?.data ?? res;
        setStats(payload || null);
      })
      .catch((err) => {
        setStats(null);
        setError(err?.message || "Không thể tải dữ liệu thống kê");
      })
      .finally(() => setLoading(false));
  }, [filterType, selectedYear, selectedMonth]);

  useEffect(() => {
    loadStats();
  }, [filterType, selectedYear, selectedMonth]);

  const chartData = useMemo(() => {
    if (!stats) return [];
    const source = filterType === "month" ? stats.dailyRevenues : stats.monthlyRevenues;
    return (source || []).map((item) => ({
      name: item.day && item.month && item.year
        ? `Ngày ${item.day}/${item.month}`
        : item.month && item.year
          ? `T${item.month}/${item.year}`
          : `${item.year}`,
      revenue: Number(item.revenue) || 0,
      orderCount: Number(item.orderCount) || 0,
      day: item.day,
      month: item.month,
      year: item.year,
    }));
  }, [stats, filterType]);

  const topMotorcycles = stats?.topMotorcycles || [];
  const totalRevenue = Number(stats?.totalRevenue) || 0;
  const totalOrders = Number(stats?.totalOrders) || 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const summary = {
    totalRevenue: formatCurrency(totalRevenue),
    totalOrders,
    avgOrderValue: formatCurrency(avgOrderValue),
    totalCustomers: stats?.totalCustomers || 0,
    totalMotorcycles: stats?.totalMotorcycles || 0,
  };

  const filterLabel = useMemo(() => {
    if (filterType === "month" && selectedYear && selectedMonth) {
      return `Tháng ${selectedMonth}/${selectedYear}`;
    }
    if (filterType === "year" && selectedYear) {
      return `Năm ${selectedYear}`;
    }
    return "Tất cả";
  }, [filterType, selectedYear, selectedMonth]);

  const fileName = useMemo(() => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 10).replace(/-/g, "");
    if (filterType === "month" && selectedYear && selectedMonth) {
      return `BaoCao-ThongKe-Thang-${selectedYear}${String(selectedMonth).padStart(2, "0")}-${timestamp}.xlsx`;
    }
    if (filterType === "year" && selectedYear) {
      return `BaoCao-ThongKe-Nam-${selectedYear}-${timestamp}.xlsx`;
    }
    return `BaoCao-ThongKe-${timestamp}.xlsx`;
  }, [filterType, selectedYear, selectedMonth]);

  const handleExport = async (type) => {
    if (!chartData.length && !topMotorcycles.length) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }
    setExporting(type);
    await new Promise((r) => setTimeout(r, 50));

    try {
      if (type === "excel") {
        exportExcel(chartData, topMotorcycles, summary, filterLabel);
      } else {
        exportPDF(chartData, topMotorcycles, summary, filterLabel);
      }
      toast.success(type === "excel" ? "Đã xuất file Excel thành công" : "Đã xuất file PDF thành công");
    } catch {
      toast.error("Không thể xuất file");
    } finally {
      setExporting(null);
    }
  };

  const exportExcel = (chartData, topMotorcycles, summary, filterLabel) => {
    try {
      const wb = XLSX.utils.book_new();

      const summaryRows = [
        ["Khoảng thời gian", filterLabel],
        ["Tổng doanh thu", summary.totalRevenue],
        ["Tổng đơn hàng", summary.totalOrders],
        ["Giá trị đơn hàng TB", summary.avgOrderValue],
        ["Tổng khách hàng", summary.totalCustomers],
        ["Tổng số xe", summary.totalMotorcycles],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet([
        ["CHỈ SỐ", "GIÁ TRỊ"],
        ...summaryRows,
      ]);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Tổng quan");

      if (chartData.length > 0) {
        const wsChart = XLSX.utils.aoa_to_sheet([
          [filterType === "month" ? "Ngày" : "Tháng", "Năm", "Doanh thu", "Số đơn"],
          ...chartData.map((item) => [
            item.name,
            item.year,
            item.revenue,
            item.orderCount,
          ]),
        ]);
        XLSX.utils.book_append_sheet(wb, wsChart, "Doanh thu");
      }

      if (topMotorcycles.length > 0) {
        const wsTop = XLSX.utils.aoa_to_sheet([
          ["Xe", "Số lượng bán", "Doanh thu"],
          ...topMotorcycles.map((m) => [
            m.motorcycleName,
            `${m.soldCount} xe`,
            formatCurrency(m.revenue),
          ]),
        ]);
        XLSX.utils.book_append_sheet(wb, wsTop, "Top xe bán chạy");
      }

      XLSX.writeFile(wb, fileName);
    } catch {
      toast.error("Không thể xuất file Excel");
    }
  };

  const exportPDF = (chartData, topMotorcycles, summary, filterLabel) => {
    try {
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(16);
      doc.text("BÁO CÁO THỐNG KÊ - IRON SHOWROOM", 14, 15);
      doc.setFontSize(10);
      doc.text(`Khoảng thời gian: ${filterLabel}`, 14, 22);
      doc.text(`Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, 14, 28);

      doc.setFontSize(12);
      doc.text("1. Tổng quan", 14, 38);
      autoTable(doc, {
        startY: 41,
        head: [["Chỉ số", "Giá trị"]],
        body: [
          ["Tổng doanh thu", summary.totalRevenue],
          ["Tổng đơn hàng", `${summary.totalOrders} đơn`],
          ["Giá trị đơn hàng TB", summary.avgOrderValue],
          ["Tổng khách hàng", `${summary.totalCustomers} người`],
          ["Tổng số xe", `${summary.totalMotorcycles} xe`],
        ],
        styles: { fontSize: 10 },
        headStyles: { fillColor: [249, 115, 22] },
      });

      if (chartData.length > 0) {
        doc.setFontSize(12);
        doc.text("2. Doanh thu theo thời gian", 14, doc.lastAutoTable.finalY + 10);
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 13,
          head: [[filterType === "month" ? "Ngày" : "Tháng", "Năm", "Doanh thu", "Số đơn"]],
          body: chartData.map((item) => [
            item.name,
            item.year,
            formatCurrency(item.revenue),
            `${item.orderCount} đơn`,
          ]),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [249, 115, 22] },
        });
      }

      if (topMotorcycles.length > 0) {
        doc.setFontSize(12);
        doc.text(
          "3. Top xe bán chạy",
          14,
          chartData.length > 0 ? doc.lastAutoTable.finalY + 10 : doc.lastAutoTable.finalY + 8,
        );
        autoTable(doc, {
          startY:
            chartData.length > 0
              ? doc.lastAutoTable.finalY + 13
              : doc.lastAutoTable.finalY + 11,
          head: [["Xe", "Số lượng bán", "Doanh thu"]],
          body: topMotorcycles.map((m) => [
            m.motorcycleName,
            `${m.soldCount} xe`,
            formatCurrency(m.revenue),
          ]),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [249, 115, 22] },
        });
      }

      doc.save(fileName.replace(".xlsx", ".pdf"));
    } catch {
      toast.error("Không thể xuất file PDF");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Thống kê doanh thu
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Biểu đồ đường doanh thu theo thời gian, kèm top xe bán chạy
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleExport("excel")}
            disabled={loading || exporting !== null}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            {exporting === "excel" ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={15} />
            )}
            Xuất Excel
          </button>
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            disabled={loading || exporting !== null}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {exporting === "pdf" ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <FileText size={15} />
            )}
            Xuất PDF
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setFilterType("year")}
              className={`px-4 py-2 text-sm font-medium transition ${
                filterType === "year"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Theo Năm
            </button>
            <button
              type="button"
              onClick={() => setFilterType("month")}
              className={`px-4 py-2 text-sm font-medium transition ${
                filterType === "month"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Theo Tháng
            </button>
          </div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>

          {filterType === "month" && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-white py-20 shadow-sm">
          <Loader2 size={28} className="animate-spin text-orange-500" />
          <p className="text-sm text-gray-500">Đang tải dữ liệu thống kê...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 py-16 text-center shadow-sm">
          <AlertTriangle size={32} className="text-red-500" />
          <div>
            <p className="font-semibold text-red-700">
              Không thể tải dữ liệu thống kê
            </p>
            <p className="mt-1 text-sm text-red-500">{error}</p>
          </div>
          <button
            type="button"
            onClick={loadStats}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <Loader2 size={15} />
            Thử lại
          </button>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Tổng doanh thu", value: summary.totalRevenue },
              { label: "Tổng đơn hàng", value: `${summary.totalOrders} đơn` },
              { label: "Giá trị đơn TB", value: summary.avgOrderValue },
              { label: "Tổng khách hàng", value: summary.totalCustomers },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="mt-1 text-xl font-bold text-gray-800">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <StatisticChart stats={stats} filterType={filterType} chartRefs={chartRefs} />

          {/* Top motorcycles table */}
          {topMotorcycles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <h2 className="font-semibold text-gray-700 mb-4">
                Chi tiết top xe bán chạy
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Xe</th>
                      <th className="px-4 py-3 text-center">Số lượng bán</th>
                      <th className="px-4 py-3 text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topMotorcycles.map((m, i) => (
                      <tr key={m.motorcycleId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{i + 1}</td>
                        <td className="px-4 py-3 flex items-center gap-3">
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
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StatisticsPage;
