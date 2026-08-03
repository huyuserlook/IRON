import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import motorcycleApi from "../../../api/motorcycleApi";
import { formatCurrency } from "../../../utils/formatCurrency";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";

const MotorcycleManagement = () => {
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    motorcycleApi
      .search({ keyword, page, size: 10 })
      .then((res) => setData(res.data || {}))
      .finally(() => setLoading(false));
  }, [keyword, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Xóa xe "${name}"?`)) return;
    try {
      await motorcycleApi.delete(id);
      toast.success("Đã xóa xe");
      load();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const statusBadge = {
    AVAILABLE: "bg-green-100 text-green-700",
    OUT_OF_STOCK: "bg-red-100 text-red-600",
    COMING_SOON: "bg-blue-100 text-blue-600",
  };
  const statusLabel = {
    AVAILABLE: "Còn hàng",
    OUT_OF_STOCK: "Hết hàng",
    COMING_SOON: "Sắp ra mắt",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý xe</h1>
        <Link
          to="/admin/motorcycles/add"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Thêm xe mới
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Tìm kiếm xe..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Xe</th>
              <th className="px-4 py-3 text-left">Hãng / Dòng</th>
              <th className="px-4 py-3 text-right">Giá</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading
              ? Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-4 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
              : data.content?.map((moto) => (
                  <tr
                    key={moto.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {moto.thumbnailUrl ? (
                          <img
                            src={moto.thumbnailUrl}
                            alt={moto.name}
                            className="w-12 h-10 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-10 bg-gray-100 rounded-lg" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800 line-clamp-1">
                            {moto.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {moto.engineCc ? `${moto.engineCc}cc` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {moto.brandName} · {moto.categoryName}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-600">
                      {formatCurrency(moto.price)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[moto.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {statusLabel[moto.status] || moto.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/motorcycles/edit/${moto.id}`}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(moto.id, moto.name)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            {Array.from({ length: data.totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-8 h-8 rounded-lg text-sm transition-colors ${i === page ? "bg-orange-500 text-white" : "hover:bg-gray-100 text-gray-600"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MotorcycleManagement;
