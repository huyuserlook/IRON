import { useEffect, useState } from "react";
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

const exportExcel = (chartData, yearlyData, topMotorcycles, summary) => {
  try {
    const wb = XLSX.utils.book_new();

    const summaryRows = [
      ["Tổng doanh thu", summary.totalRevenue],
      ["Tổng đơn hàng", summary.totalOrders],
      ["Tổng khách hàng", summary.totalCustomers],
      ["Tổng số xe", summary.totalMotorcycles],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet([
      ["CHỈ SỐ", "GIÁ TRỊ"],
      ...summaryRows,
      [],
      ["THỐNG KÊ DOANH THU THEO THÁNG"],
      ["Tháng", "Năm", "Doanh thu", "Số đơn"],
      ...chartData.map((m) => [m.name, m.year, m.revenue, m.orderCount]),
      [],
      ["THỐNG KÊ DOANH THU THEO NĂM"],
      ["Năm", "Doanh thu", "Số đơn"],
      ...yearlyData.map((y) => [y.year, y.revenue, y.orderCount]),
      [],
      ["TOP XE BÁN CHẠY"],
      ["Xe", "Đã bán", "Doanh thu"],
      ...topMotorcycles.map((m) => [
        m.motorcycleName,
        `${m.soldCount} xe`,
        m.revenue,
      ]),
    ]);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Thống kê");

    XLSX.writeFile(wb, "thong-ke-iron.xlsx");
    toast.success("Đã xuất file Excel thành công");
  } catch {
    toast.error("Không thể xuất file Excel");
  }
};

const exportPDF = (chartData, yearlyData, topMotorcycles, summary) => {
  try {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("BÁO CÁO THỐNG KÊ - IRON SHOWROOM", 14, 15);
    doc.setFontSize(10);
    doc.text(`Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, 14, 22);

    // Summary
    doc.setFontSize(12);
    doc.text("1. Chỉ số tổng quan", 14, 32);
    autoTable(doc, {
      startY: 35,
      head: [["Chỉ số", "Giá trị"]],
      body: [
        ["Tổng doanh thu", summary.totalRevenue],
        ["Tổng đơn hàng", summary.totalOrders],
        ["Tổng khách hàng", summary.totalCustomers],
        ["Tổng số xe", summary.totalMotorcycles],
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [249, 115, 22] },
    });

    // Monthly revenue
    doc.setFontSize(12);
    doc.text("2. Doanh thu theo tháng", 14, doc.lastAutoTable.finalY + 10);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 13,
      head: [["Tháng", "Doanh thu", "Số đơn"]],
      body: chartData.map((m) => [m.name, m.revenue, m.orderCount]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [249, 115, 22] },
    });

    // Yearly revenue
    doc.setFontSize(12);
    doc.text(
      "3. Doanh thu theo năm",
      14,
      doc.lastAutoTable.finalY + 10,
    );
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 13,
      head: [["Năm", "Doanh thu", "Số đơn"]],
      body: yearlyData.map((y) => [y.year, y.revenue, y.orderCount]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [249, 115, 22] },
    });

    // Top motorcycles
    doc.setFontSize(12);
    doc.text(
      "4. Top xe bán chạy",
      14,
      doc.lastAutoTable.finalY + 10,
    );
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 13,
      head: [["Xe", "Đã bán", "Doanh thu"]],
      body: topMotorcycles.map((m) => [
        m.motorcycleName,
        `${m.soldCount} xe`,
        m.revenue,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [249, 115, 22] },
    });

    doc.save("thong-ke-iron.pdf");
    toast.success("Đã xuất file PDF thành công");
  } catch {
    toast.error("Không thể xuất file PDF");
  }
};

const StatisticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(null);

  const loadStats = () => {
    setLoading(true);
    setError(null);
    adminApi
      .getStatistics()
      .then((res) => {
        const payload = res?.data ?? res;
        setStats(payload || null);
      })
      .catch((err) => {
        setStats(null);
        setError(err?.message || "Không thể tải dữ liệu thống kê");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  const chartData =
    stats?.monthlyRevenues?.map((m) => ({
      name: `T${m.month}/${m.year}`,
      year: m.year,
      revenue: Number(m.revenue) || 0,
      orderCount: m.orderCount,
    })) || [];

  const yearlyData =
    stats?.yearlyRevenues?.map((y) => ({
      year: y.year,
      revenue: Number(y.revenue) || 0,
      orderCount: y.orderCount,
    })) || [];

  const topMotorcycles = stats?.topMotorcycles || [];
  const summary = {
    totalRevenue: formatCurrency(stats?.totalRevenue || 0),
    totalOrders: stats?.totalOrders || 0,
    totalCustomers: stats?.totalCustomers || 0,
    totalMotorcycles: stats?.totalMotorcycles || 0,
  };

  const handleExport = async (type) => {
    if (!chartData.length && !topMotorcycles.length && !yearlyData.length) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }
    setExporting(type);
    // allow UI to show the pending state
    await new Promise((r) => setTimeout(r, 50));
    if (type === "excel")
      exportExcel(chartData, yearlyData, topMotorcycles, summary);
    else exportPDF(chartData, yearlyData, topMotorcycles, summary);
    setExporting(null);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Thống kê doanh thu
          </h1>
            <p className="mt-1 text-sm text-gray-500">
              Biểu đồ tròn doanh thu theo tháng và năm, kèm top xe bán chạy
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
              { label: "Tổng đơn hàng", value: summary.totalOrders },
              { label: "Tổng khách hàng", value: summary.totalCustomers },
              { label: "Tổng số xe", value: summary.totalMotorcycles },
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
          <StatisticChart stats={stats} type="all" />

          {/* Top motorcycles + monthly table */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Top motorcycles */}
            {topMotorcycles.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-gray-700 mb-4">
                  Top xe bán chạy
                </h2>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Xe</th>
                      <th className="px-4 py-3 text-center">Đã bán</th>
                      <th className="px-4 py-3 text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topMotorcycles.map((m, i) => (
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

            {/* Monthly revenue table */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-gray-700 mb-4">
                  Chi tiết doanh thu theo tháng
                </h2>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Tháng</th>
                      <th className="px-4 py-3 text-right">Số đơn</th>
                      <th className="px-4 py-3 text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {chartData.map((m) => (
                      <tr key={m.name} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {m.name}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {m.orderCount} đơn
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

           {/* Yearly revenue table */}
           {yearlyData.length > 0 && (
             <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
               <h2 className="font-semibold text-gray-700 mb-4">
                 Chi tiết doanh thu theo năm
               </h2>
               <table className="w-full text-sm">
                 <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                   <tr>
                     <th className="px-4 py-3 text-left">Năm</th>
                     <th className="px-4 py-3 text-right">Số đơn</th>
                     <th className="px-4 py-3 text-right">Doanh thu</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {yearlyData.map((y) => (
                     <tr key={y.year} className="hover:bg-gray-50">
                       <td className="px-4 py-3 font-medium text-gray-800">
                         {y.year}
                       </td>
                       <td className="px-4 py-3 text-right text-gray-600">
                         {y.orderCount} đơn
                       </td>
                       <td className="px-4 py-3 text-right font-semibold text-orange-600">
                         {formatCurrency(y.revenue)}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </>
       )}
     </div>
   );
};

export default StatisticsPage;
