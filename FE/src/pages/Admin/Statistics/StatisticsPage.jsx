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
import html2canvas from "html2canvas";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => currentYear - i);
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

const dataUrlToBuffer = (dataUrl) => {
  try {
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (e) {
    console.error("Failed to convert data URL to buffer:", e);
    return null;
  }
};

const captureChartImages = async (chartRefs) => {
  const images = {};
  const entries = [
    { key: "line", ref: chartRefs?.line },
    { key: "bar", ref: chartRefs?.bar },
  ];
  for (const entry of entries) {
    const container = entry.ref?.current;
    if (!container) continue;
    try {
      const svg = container.querySelector("svg");
      if (!svg) continue;
      const width = svg.clientWidth || container.clientWidth || 800;
      const height = svg.clientHeight || container.clientHeight || 360;
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
      };
      await new Promise((resolve, reject) => {
        img.onerror = (e) => {
          URL.revokeObjectURL(url);
          reject(e);
        };
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        img.src = url;
      });
      const dataUrl = canvas.toDataURL("image/png");
      if (dataUrl && dataUrl !== "data:,") {
        images[entry.key] = dataUrl;
      }
    } catch (e) {
      console.error("Failed to capture chart:", entry.key, e);
    }
  }
  return images;
};

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
  }, [loadStats, filterType, selectedYear, selectedMonth]);

  const chartData = useMemo(() => {
    if (!stats) return [];
    const source = filterType === "month" ? stats.dailyRevenues : stats.monthlyRevenues;
    return (source || []).map((item) => ({
      name: item.day && item.month && item.year
        ? `Ngay ${item.day}/${item.month}`
        : item.month && item.year
          ? `T${item.month}/${item.year}`
          : `${item.year}`,
      revenue: Number(item.revenue) || 0,
      profit: Number(item.profit) || 0,
      orderCount: Number(item.orderCount) || 0,
      day: item.day,
      month: item.month,
      year: item.year,
    }));
  }, [stats, filterType]);

  const topMotorcycles = stats?.topMotorcycles || [];
  const totalRevenue = Number(stats?.totalRevenue) || 0;
  const totalProfit = Number(stats?.totalProfit) || 0;
  const totalOrders = Number(stats?.totalOrders) || 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const summary = {
    totalRevenue: formatCurrency(totalRevenue),
    totalProfit: formatCurrency(totalProfit),
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
      const chartImages = await captureChartImages(chartRefs);
      if (type === "excel") {
        await exportExcel(chartData, topMotorcycles, summary, filterLabel, chartImages);
      } else {
        await exportPDF(chartData, topMotorcycles, summary, filterLabel, chartImages);
      }
      toast.success(type === "excel" ? "Đã xuất file Excel thành công" : "Đã xuất file PDF thành công");
    } catch (e) {
      console.error("Export error:", e);
      toast.error("Không thể xuất file");
    } finally {
      setExporting(null);
    }
  };

  const exportExcel = async (chartData, topMotorcycles, summary, filterLabel, chartImages) => {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "IRON Admin";
      workbook.created = new Date();

      const headerFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF97316" } };
      const headerFont = { bold: true, color: { argb: "FFFFFFFF" } };

      const wsSummary = workbook.addWorksheet("Tổng quan");
      wsSummary.columns = [
        { header: "Chỉ số", key: "label", width: 30 },
        { header: "Giá trị", key: "value", width: 40 },
      ];
      const summaryHeader = wsSummary.addRow(["CHỈ SỐ", "GIÁ TRỊ"]);
      summaryHeader.font = headerFont;
      summaryHeader.fill = headerFill;
      wsSummary.addRow(["Khoảng thời gian", filterLabel]);
      wsSummary.addRow(["Tổng doanh thu", summary.totalRevenue]);
      wsSummary.addRow(["Tổng lợi nhuận", summary.totalProfit]);
      wsSummary.addRow(["Tổng đơn hàng", `${summary.totalOrders} đơn`]);
      wsSummary.addRow(["Giá trị đơn hàng TB", summary.avgOrderValue]);
      wsSummary.addRow(["Tổng khách hàng", `${summary.totalCustomers} người`]);
      wsSummary.addRow(["Tổng số xe", `${summary.totalMotorcycles} xe`]);

      if (chartData.length > 0) {
        const wsChart = workbook.addWorksheet("Doanh thu");
        wsChart.columns = [
          { header: filterType === "month" ? "Ngày" : "Tháng", key: "name", width: 20 },
          { header: "Năm", key: "year", width: 10 },
          { header: "Doanh thu", key: "revenue", width: 22 },
          { header: "Lợi nhuận", key: "profit", width: 22 },
          { header: "Số đơn", key: "orderCount", width: 12 },
        ];
        const chartHeader = wsChart.addRow(wsChart.columns.map((c) => c.header));
        chartHeader.font = headerFont;
        chartHeader.fill = headerFill;
        chartData.forEach((item) => {
          wsChart.addRow([item.name, item.year, item.revenue, item.profit, `${item.orderCount} đơn`]);
        });
      }

      if (topMotorcycles.length > 0) {
        const wsTop = workbook.addWorksheet("Top xe bán chạy");
        wsTop.columns = [
          { header: "Xe", key: "name", width: 50 },
          { header: "Số lượng bán", key: "sold", width: 15 },
          { header: "Doanh thu", key: "revenue", width: 22 },
          { header: "Lợi nhuận", key: "profit", width: 22 },
        ];
        const topHeader = wsTop.addRow(wsTop.columns.map((c) => c.header));
        topHeader.font = headerFont;
        topHeader.fill = headerFill;
        topMotorcycles.forEach((m) => {
          wsTop.addRow([m.motorcycleName, `${m.soldCount} xe`, formatCurrency(m.revenue), formatCurrency(m.profit)]);
        });
      }

      const rawBuffer = await workbook.xlsx.writeBuffer();
      const buffer = rawBuffer instanceof ArrayBuffer ? rawBuffer : new Uint8Array(rawBuffer).buffer;
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (e) {
      console.error("Excel export error:", e);
      toast.error("Không thể xuất file Excel");
    }
  };

  const exportPDF = async (chartData, topMotorcycles, summary, filterLabel, chartImages) => {
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const usableWidth = pageWidth - margin * 2;
      let y = margin;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.text("BAO CAO THONG KE - IRON SHOWROOM", margin, y);
      y += 22;
      doc.setFontSize(10);
      doc.text(`Khoang thoi gian: ${filterLabel}`, margin, y);
      y += 14;
      doc.text(`Ngay xuat: ${new Date().toLocaleDateString("vi-VN")}`, margin, y);
      y += 20;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("1. Tong quan", margin, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [["Chi so", "Gia tri"]],
        body: [
          ["Tong doanh thu", summary.totalRevenue],
          ["Tong loi nhuan", summary.totalProfit],
          ["Tong don hang", `${summary.totalOrders} don`],
          ["Gia tri don hang TB", summary.avgOrderValue],
          ["Tong khach hang", `${summary.totalCustomers} nguoi`],
          ["Tong so xe", `${summary.totalMotorcycles} xe`],
        ],
        theme: "grid",
        headStyles: { fillColor: [249, 115, 22], fontSize: 10 },
        styles: { fontSize: 10, cellPadding: 6 },
        margin: { left: margin, right: margin },
      });
      y = doc.lastAutoTable.finalY + 18;

      if (chartImages.line) {
        if (y + 170 > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text("2. Doanh thu va loi nhuan theo thoi gian", margin, y);
        y += 8;
        doc.addImage(chartImages.line, "PNG", margin, y, usableWidth, 170);
        y += 180;
      }

      if (chartImages.bar) {
        if (y + 170 > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text("3. Top xe ban chay", margin, y);
        y += 8;
        doc.addImage(chartImages.bar, "PNG", margin, y, usableWidth, 170);
        y += 180;
      }

      if (topMotorcycles.length > 0) {
        if (y + 140 > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text("4. Chi tiet top xe ban chay", margin, y);
        y += 6;
        autoTable(doc, {
          startY: y,
          head: [["Xe", "So luong ban", "Doanh thu", "Loi nhuan"]],
          body: topMotorcycles.map((m) => [
            m.motorcycleName,
            `${m.soldCount} xe`,
            formatCurrency(m.revenue),
            formatCurrency(m.profit),
          ]),
          theme: "grid",
          headStyles: { fillColor: [249, 115, 22], fontSize: 10 },
          styles: { fontSize: 9, cellPadding: 5 },
          margin: { left: margin, right: margin },
        });
      }

      doc.save(fileName.replace(".xlsx", ".pdf"));
    } catch (e) {
      console.error("PDF export error:", e);
      toast.error("Khong the xuat file PDF");
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
              { label: "Tổng lợi nhuận", value: summary.totalProfit },
              { label: "Tổng đơn hàng", value: `${summary.totalOrders} đơn` },
              { label: "Giá trị đơn TB", value: summary.avgOrderValue },
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
                      <th className="px-4 py-3 text-right">Lợi nhuận</th>
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
                        <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                          {formatCurrency(m.profit)}
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
