import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import motorcycleApi from "../../api/motorcycleApi";
import brandApi from "../../api/brandApi";
import categoryApi from "../../api/categoryApi";
import { formatCurrency } from "../../utils/formatCurrency";
import { useDebounce } from "../../hooks/useDebounce";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const MotorcyclePage = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
  });
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    brandId: searchParams.get("brandId") || "",
    categoryId: searchParams.get("categoryId") || "",
    minPrice: "",
    maxPrice: "",
    page: 0,
    size: 12,
  });

  const debouncedKeyword = useDebounce(filters.keyword, 500);

  useEffect(() => {
    brandApi.getAll().then((res) => setBrands(res.data || []));
    categoryApi.getAll().then((res) => setCategories(res.data || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {
      keyword: debouncedKeyword,
      brandId: filters.brandId,
      categoryId: filters.categoryId,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      page: filters.page,
      size: filters.size,
    };
    Object.keys(params).forEach(
      (k) => !params[k] && params[k] !== 0 && delete params[k],
    );
    motorcycleApi
      .search(params)
      .then((res) => setData(res.data || { content: [], totalPages: 0 }))
      .finally(() => setLoading(false));
  }, [
    debouncedKeyword,
    filters.brandId,
    filters.categoryId,
    filters.minPrice,
    filters.maxPrice,
    filters.page,
    filters.size,
  ]);

  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 0 }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Danh sách xe mô tô
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Tìm kiếm xe..."
            value={filters.keyword}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, keyword: e.target.value }))
            }
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <select
          value={filters.brandId}
          onChange={(e) => setFilter("brandId", e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="">Tất cả hãng</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={filters.categoryId}
          onChange={(e) => setFilter("categoryId", e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="">Tất cả dòng xe</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Giá từ"
          value={filters.minPrice}
          onChange={(e) => setFilter("minPrice", e.target.value)}
          className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <input
          type="number"
          placeholder="Đến"
          value={filters.maxPrice}
          onChange={(e) => setFilter("maxPrice", e.target.value)}
          className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />

        <button
          onClick={() =>
            setFilters({
              keyword: "",
              brandId: "",
              categoryId: "",
              minPrice: "",
              maxPrice: "",
              page: 0,
              size: 12,
            })
          }
          className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
        >
          Xóa bộ lọc
        </button>
      </div>

      {/* Results */}
      <p className="text-sm text-gray-500 mb-4">
        Tìm thấy <b>{data.totalElements}</b> xe
      </p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.content?.map((moto) => (
            <Link
              key={moto.id}
              to={`/motorcycles/${moto.slug}`}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 transition-shadow group"
            >
              <div className="h-44 bg-gray-100 overflow-hidden">
                {moto.thumbnailUrl ? (
                  <img
                    src={moto.thumbnailUrl}
                    alt={moto.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    Chưa có ảnh
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-orange-500 font-medium">
                  {moto.brandName} · {moto.categoryName}
                </p>
                <h3 className="font-semibold text-gray-800 text-sm mt-1 mb-2 line-clamp-2">
                  {moto.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-orange-600 font-bold text-sm">
                    {formatCurrency(moto.price)}
                  </span>
                  {moto.engineCc && (
                    <span className="text-xs text-gray-400">
                      {moto.engineCc}cc
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
            disabled={filters.page === 0}
            className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-gray-600">
            Trang {filters.page + 1} / {data.totalPages}
          </span>
          <button
            onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
            disabled={filters.page >= data.totalPages - 1}
            className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MotorcyclePage;
