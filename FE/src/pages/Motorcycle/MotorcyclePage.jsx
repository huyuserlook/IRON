import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import motorcycleApi from "../../api/motorcycleApi";
import brandApi from "../../api/brandApi";
import categoryApi from "../../api/categoryApi";
import { useDebounce } from "../../hooks/useDebounce";
import {
  ArrowRight,
  Bike,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from "lucide-react";

const PAGE_SIZE = 12;

const sortOptions = [
  { value: "createdAt-desc", label: "Mới nhất" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "horsepower-desc", label: "Công suất cao" },
  { value: "engineCc-desc", label: "Dung tích lớn" },
];

const engineBands = [
  { key: "600", label: "600cc", min: 0, max: 599 },
  { key: "1000", label: "1000cc", min: 600, max: 1000 },
  { key: "1200+", label: "1200cc+", min: 1201, max: null },
];

const statusMeta = {
  AVAILABLE: { label: "Bán chạy", className: "bg-[#BC000A] text-white" },
  OUT_OF_STOCK: { label: "Hết hàng", className: "bg-[#1A1B1F] text-white" },
  COMING_SOON: { label: "Sắp ra mắt", className: "bg-[#F0EDF4] text-[#5F5E5E]" },
  DISCONTINUED: { label: "Ngừng SX", className: "bg-[#F0EDF4] text-[#5F5E5E]" },
};

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:8080/api")
  .replace(/\/api\/?$/, "");

const normalizePayload = (res) => res?.data ?? res;

const isEmptyValue = (value) =>
  value === "" || value === null || value === undefined;

const resolveImageUrl = (url) => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  if (url.startsWith("/")) return `${API_ROOT}${url}`;
  return `${API_ROOT}/${url}`;
};

const formatListingPrice = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₫ --";
  return `₫ ${new Intl.NumberFormat("en-US").format(amount)}`;
};

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
  const [favorites, setFavorites] = useState(() => new Set());
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 0 });
  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    brandId: searchParams.get("brandId") || "",
    categoryId: searchParams.get("categoryId") || "",
    engineBand: searchParams.get("engineBand") || "",
    minPrice: null,
    maxPrice: null,
    page: 0,
    size: PAGE_SIZE,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const debouncedKeyword = useDebounce(filters.keyword, 400);

  useEffect(() => {
    let alive = true;

    brandApi
      .getAll()
      .then((res) => {
        if (!alive) return;
        const payload = normalizePayload(res);
        setBrands(Array.isArray(payload) ? payload : payload || []);
      })
      .catch(() => {
        if (!alive) return;
        setBrands([]);
      });

    categoryApi
      .getAll()
      .then((res) => {
        if (!alive) return;
        const payload = normalizePayload(res);
        setCategories(Array.isArray(payload) ? payload : payload || []);
      })
      .catch(() => {
        if (!alive) return;
        setCategories([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    Promise.all([
      motorcycleApi.search({ page: 0, size: 1, sortBy: "price", sortDir: "asc" }),
      motorcycleApi.search({
        page: 0,
        size: 1,
        sortBy: "price",
        sortDir: "desc",
      }),
    ])
      .then(([minRes, maxRes]) => {
        if (!alive) return;

        const minPayload = normalizePayload(minRes);
        const maxPayload = normalizePayload(maxRes);
        const minMoto = Array.isArray(minPayload)
          ? minPayload[0]
          : minPayload?.content?.[0];
        const maxMoto = Array.isArray(maxPayload)
          ? maxPayload[0]
          : maxPayload?.content?.[0];

        const min = Number(minMoto?.price ?? 0);
        const max = Number(maxMoto?.price ?? min);

        if (Number.isFinite(min) && Number.isFinite(max) && max >= min) {
          setPriceBounds({ min, max });
        }
      })
      .catch(() => {
        if (!alive) return;
        setPriceBounds({ min: 0, max: 0 });
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setLoading(true);

    const params = {
      keyword: debouncedKeyword,
      brandId: filters.brandId,
      categoryId: filters.categoryId,
      engineCcMin:
        engineBands.find((band) => band.key === filters.engineBand)?.min ??
        undefined,
      engineCcMax:
        engineBands.find((band) => band.key === filters.engineBand)?.max ??
        undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      page: filters.page,
      size: filters.size,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
    };

    Object.keys(params).forEach((key) => {
      if (isEmptyValue(params[key])) delete params[key];
    });

    motorcycleApi
      .search(params)
      .then((res) => {
        const payload = normalizePayload(res);
        setData(payload || { content: [], totalPages: 0, totalElements: 0 });
      })
      .finally(() => setLoading(false));
  }, [
    debouncedKeyword,
    filters.brandId,
    filters.categoryId,
    filters.engineBand,
    filters.minPrice,
    filters.maxPrice,
    filters.page,
    filters.size,
    filters.sortBy,
    filters.sortDir,
  ]);

  const priceFallback = useMemo(() => {
    const prices = data.content
      .map((item) => Number(item?.price))
      .filter((value) => Number.isFinite(value));

    if (!prices.length) return { min: 0, max: 0 };
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [data.content]);

  const activePriceBounds = useMemo(() => {
    if (priceBounds.max > 0) return priceBounds;
    if (priceFallback.max > 0) return priceFallback;
    return { min: 0, max: 1 };
  }, [priceBounds, priceFallback]);

  const minPriceValue = filters.minPrice ?? activePriceBounds.min;
  const maxPriceValue = filters.maxPrice ?? activePriceBounds.max;
  const priceDomain = Math.max(activePriceBounds.max - activePriceBounds.min, 1);
  const minPercent = Math.min(
    100,
    Math.max(0, ((minPriceValue - activePriceBounds.min) / priceDomain) * 100),
  );
  const maxPercent = Math.min(
    100,
    Math.max(0, ((maxPriceValue - activePriceBounds.min) / priceDomain) * 100),
  );

  const filteredCount = data.totalElements || 0;
  const itemsOnPage = data.content?.length || 0;
  const totalPages = data.totalPages || 0;

  const activeBrandFilter = filters.brandId ? 1 : 0;
  const activeFilterCount = [
    filters.keyword,
    filters.categoryId,
    filters.engineBand,
    filters.minPrice !== null,
    filters.maxPrice !== null,
    activeBrandFilter,
  ].filter(Boolean).length;

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 0,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      keyword: "",
      brandId: "",
      categoryId: "",
      engineBand: "",
      minPrice: null,
      maxPrice: null,
      page: 0,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      sortDir: "desc",
    });
  }, []);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const pageItems = useMemo(() => {
    if (!totalPages) return [];

    const current = filters.page + 1;
    const pages = [];

    for (let page = 1; page <= totalPages; page += 1) {
      const shouldShow =
        page === 1 ||
        page === totalPages ||
        Math.abs(page - current) <= 1 ||
        (current <= 3 && page <= 3) ||
        (current >= totalPages - 2 && page >= totalPages - 2);

      if (!shouldShow) continue;

      if (pages.length) {
        const prev = pages[pages.length - 1];
        if (prev !== "..." && page - Number(prev) > 1) {
          pages.push("...");
        }
      }

      pages.push(page);
    }

    return pages;
  }, [filters.page, totalPages]);

  const getPagePath = (moto) => {
    if (!moto?.slug) return "/motorcycles";
    return `/motorcycles/${moto.slug}`;
  };

  return (
    <div className="min-h-screen bg-[#F7F5FA] text-[#1A1B1F]">
      <style>{`
        @keyframes motoHeroUp {
          0% { opacity: 0; transform: translateY(22px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes motoFade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes motoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes motoPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .moto-hero-up {
          animation: motoHeroUp 0.72s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .moto-fade {
          animation: motoFade 0.55s ease-out both;
        }
        .moto-float {
          animation: motoFloat 6s ease-in-out infinite;
        }
        .moto-pulse {
          animation: motoPulse 5s ease-in-out infinite;
        }
        .moto-range {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }
        .moto-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #bc000a;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 10px rgba(188, 0, 10, 0.25);
          cursor: pointer;
          position: relative;
          z-index: 2;
        }
        .moto-range::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #bc000a;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 10px rgba(188, 0, 10, 0.25);
          cursor: pointer;
        }
        .moto-range::-webkit-slider-runnable-track {
          height: 2px;
          background: transparent;
        }
        .moto-range::-moz-range-track {
          height: 2px;
          background: transparent;
        }
        @media (prefers-reduced-motion: reduce) {
          .moto-hero-up,
          .moto-fade,
          .moto-float,
          .moto-pulse {
            animation: none !important;
          }
          .moto-range {
            transition: none !important;
          }
        }
      `}</style>

      <section className="border-b border-[#E8E3EC] bg-white">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="relative flex flex-col items-center justify-center px-4 py-20 text-center sm:py-24 lg:py-28">
            <p
              className="moto-hero-up mb-4 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#BC000A]"
              style={{ animationDelay: "40ms" }}
            >
              BỘ SƯU TẬP 2024
            </p>
            <h1
              className="moto-hero-up font-teko text-[clamp(3.5rem,8vw,5.8rem)] font-bold leading-[0.88] tracking-[-0.04em] text-[#1A1B1F]"
              style={{ animationDelay: "120ms" }}
            >
              TẤT CẢ DÒNG XE IRON
            </h1>
            <p
              className="moto-hero-up mt-5 max-w-[760px] text-sm leading-7 text-[#7A6E71] sm:text-[15px]"
              style={{ animationDelay: "200ms" }}
            >
              Khám phá đỉnh cao của kỹ thuật cơ khí và thiết kế hiện đại. Từ
              những mẫu Superbike tốc độ cao đến Adventure bền bỉ, mỗi chiếc xe
              IRON là một tác phẩm nghệ thuật đường phố.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[292px_minmax(0,1fr)]">
          <aside className="min-w-0">
            <div className="sticky top-24 rounded-[8px] border border-[#E3DEE6] bg-white p-4 shadow-[0_14px_36px_-30px_rgba(0,0,0,0.28)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#EEEAF1] pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#BC000A]" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1A1B1F]">
                    Bộ lọc
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-medium text-[#7A6E71] transition-colors hover:text-[#BC000A]"
                >
                  Xóa lọc
                </button>
              </div>

              <section className="mt-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5F5E5E]">
                    Hãng xe
                  </p>
                  <span className="text-[11px] text-[#7A6E71]">
                    {filters.brandId ? "1 bộ lọc" : "Tất cả"}
                  </span>
                </div>

                <div className="space-y-2">
                  {brands.map((brand) => {
                    const selected = String(filters.brandId) === String(brand.id || "");
                    const count = brand.count ?? brand.motorcycleCount ?? 0;
                    return (
                      <button
                        key={brand.id || "brand"}
                        type="button"
                        onClick={() =>
                          setFilter("brandId", selected ? "" : String(brand.id || ""))
                        }
                        className={`flex w-full items-center justify-between rounded-[8px] border px-3 py-2.5 text-left transition-all duration-300 ${
                          selected
                            ? "border-[#BC000A] bg-[#FFF7F7] text-[#BC000A]"
                            : "border-[#E6E1E8] bg-white text-[#1A1B1F] hover:border-[#BC000A] hover:shadow-[0_10px_24px_-22px_rgba(0,0,0,0.34)]"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border ${
                              selected
                                ? "border-[#BC000A] bg-[#BC000A] text-white"
                                : "border-[#D6D0D8] bg-white text-transparent"
                            }`}
                          >
                            <Check size={11} strokeWidth={3} />
                          </span>
                          <span className="truncate text-sm font-medium">
                            {(brand.name || "").trim()}
                          </span>
                        </span>
                        <span className="ml-3 rounded-full bg-[#F0EDF4] px-2 py-0.5 text-[11px] font-semibold text-[#6A6771]">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 mb-3 flex items-center justify-between border-t border-[#EEEAF1] pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5F5E5E]">
                    Dòng xe
                  </p>
                  <span className="text-[11px] text-[#7A6E71]">
                    {activeFilterCount > 0 ? `${activeFilterCount} bộ lọc` : "Tất cả"}
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      id: "",
                      name: "Tất cả",
                      count: filteredCount,
                    },
                    ...categories,
                  ].map((category) => {
                    const selected = String(filters.categoryId) === String(category.id || "");
                    const count = category.count ?? category.motorcycleCount ?? 0;
                    return (
                      <button
                        key={category.id || "all"}
                        type="button"
                        onClick={() =>
                          setFilter("categoryId", selected ? "" : String(category.id || ""))
                        }
                        className={`flex w-full items-center justify-between rounded-[8px] border px-3 py-2.5 text-left transition-all duration-300 ${
                          selected
                            ? "border-[#BC000A] bg-[#FFF7F7] text-[#BC000A]"
                            : "border-[#E6E1E8] bg-white text-[#1A1B1F] hover:border-[#BC000A] hover:shadow-[0_10px_24px_-22px_rgba(0,0,0,0.34)]"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border ${
                              selected
                                ? "border-[#BC000A] bg-[#BC000A] text-white"
                                : "border-[#D6D0D8] bg-white text-transparent"
                            }`}
                          >
                            <Check size={11} strokeWidth={3} />
                          </span>
                          <span className="truncate text-sm font-medium">
                            {category.name}
                          </span>
                        </span>
                        <span className="ml-3 rounded-full bg-[#F0EDF4] px-2 py-0.5 text-[11px] font-semibold text-[#6A6771]">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="mt-5 border-t border-[#EEEAF1] pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5F5E5E]">
                    Mức giá (VNĐ)
                  </p>
                </div>

                <div className="relative h-14">
                  <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#E7E1E8]" />
                  <div
                    className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#BC000A]"
                    style={{
                      left: `${minPercent}%`,
                      right: `${100 - maxPercent}%`,
                    }}
                  />
                  <input
                    type="range"
                    min={activePriceBounds.min}
                    max={activePriceBounds.max}
                    step={1}
                    value={minPriceValue}
                    onChange={(e) => {
                      const nextMin = Number(e.target.value);
                      setFilters((prev) => ({
                        ...prev,
                        minPrice: Math.min(nextMin, maxPriceValue),
                        page: 0,
                      }));
                    }}
                    className="moto-range absolute inset-x-0 top-1/2 z-10 w-full -translate-y-1/2 cursor-pointer"
                  />
                  <input
                    type="range"
                    min={activePriceBounds.min}
                    max={activePriceBounds.max}
                    step={1}
                    value={maxPriceValue}
                    onChange={(e) => {
                      const nextMax = Number(e.target.value);
                      setFilters((prev) => ({
                        ...prev,
                        maxPrice: Math.max(nextMax, minPriceValue),
                        page: 0,
                      }));
                    }}
                    className="moto-range absolute inset-x-0 top-1/2 z-20 w-full -translate-y-1/2 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)] items-center gap-2">
                  <div className="min-w-0 rounded-[8px] border border-[#E6E1E8] bg-[#FBFAFC] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A6E71]">
                      Từ
                    </p>
                    <p className="truncate text-sm font-semibold text-[#1A1B1F]">
                      {formatListingPrice(minPriceValue)}
                    </p>
                  </div>
                  <div className="text-center text-sm text-[#7A6E71]">-</div>
                  <div className="min-w-0 rounded-[8px] border border-[#E6E1E8] bg-[#FBFAFC] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A6E71]">
                      Đến
                    </p>
                    <p className="truncate text-sm font-semibold text-[#1A1B1F]">
                      {formatListingPrice(maxPriceValue)}
                    </p>
                  </div>
                </div>
              </section>

              <section className="mt-5 border-t border-[#EEEAF1] pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5F5E5E]">
                    Phân khối
                  </p>
                  <span className="text-[11px] text-[#7A6E71]">Thống kê hiện tại</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {engineBands.map((band) => {
                    const selected = filters.engineBand === band.key;
                    const count = data.content.filter((item) => {
                      const cc = Number(item?.engineCc);
                      if (!Number.isFinite(cc)) return false;
                      if (band.max === null) return cc >= band.min;
                      return cc >= band.min && cc <= band.max;
                    }).length;

                    return (
                      <button
                        key={band.key}
                        type="button"
                        onClick={() => setFilter("engineBand", selected ? "" : band.key)}
                        className={`flex items-center justify-between rounded-[8px] border px-3 py-2.5 text-left transition-all duration-300 ${
                          selected
                            ? "border-[#BC000A] bg-[#BC000A] text-white shadow-[0_12px_26px_-24px_rgba(188,0,10,0.5)]"
                            : "border-[#E6E1E8] bg-white text-[#1A1B1F] hover:border-[#BC000A] hover:shadow-[0_12px_26px_-24px_rgba(0,0,0,0.32)]"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold">{band.label}</p>
                          <p className={`mt-1 text-xs ${selected ? "text-white/80" : "text-[#7A6E71]"}`}>
                            {band.max === null
                              ? `Từ ${band.min}cc`
                              : `${band.min} - ${band.max}cc`}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            selected ? "bg-white/15 text-white" : "bg-[#F0EDF4] text-[#6A6771]"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="moto-hero-up" style={{ animationDelay: "40ms" }}>
                <p className="text-sm font-medium text-[#1A1B1F]">
                  Hiển thị {itemsOnPage} trên {filteredCount} kết quả
                </p>
                <p className="mt-1 text-xs text-[#7A6E71]">
                  {activeFilterCount > 0 ? `${activeFilterCount} bộ lọc đang áp dụng` : "Toàn bộ danh mục đang hiển thị"}
                </p>
              </div>

              <div className="moto-hero-up flex items-center gap-3" style={{ animationDelay: "100ms" }}>
                <div className="relative">
                  <select
                    value={`${filters.sortBy}-${filters.sortDir}`}
                    onChange={(e) => {
                      const [sortBy, sortDir] = e.target.value.split("-");
                      setFilters((prev) => ({
                        ...prev,
                        sortBy,
                        sortDir,
                        page: 0,
                      }));
                    }}
                    className="appearance-none rounded-[8px] border border-[#E3DEE6] bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-[#1A1B1F] outline-none transition-colors focus:border-[#BC000A]"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6E71]"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[520px] animate-pulse rounded-[8px] border border-[#E3DEE6] bg-white"
                  />
                ))}
              </div>
            ) : data.content?.length ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {data.content.map((moto, index) => {
                  const isFavorite = favorites.has(moto.id);
                  const imageUrl = resolveImageUrl(
                    moto.thumbnailUrl || moto.imageUrl || moto.images?.[0]?.imageUrl,
                  );
                  const status = statusMeta[moto.status] || statusMeta.AVAILABLE;

                  return (
                    <article
                      key={moto.id}
                      className="moto-fade group flex h-full flex-col overflow-hidden rounded-[8px] border border-[#E3DEE6] bg-white shadow-[0_16px_36px_-30px_rgba(0,0,0,0.28)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_22px_44px_-30px_rgba(0,0,0,0.2)]"
                      style={{ animationDelay: `${index * 85}ms` }}
                    >
                      <div className="relative border-b border-[#EEEAF1] bg-white">
                        <div className="absolute left-3 top-3 z-20">
                          <span
                            className={`inline-flex items-center rounded-[4px] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleFavorite(moto.id)}
                          className={`absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white/90 shadow-[0_10px_20px_-16px_rgba(0,0,0,0.35)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 ${
                            isFavorite
                              ? "border-[#BC000A] text-[#BC000A]"
                              : "border-transparent text-[#6A6771] hover:border-[#BC000A] hover:text-[#BC000A]"
                          }`}
                          aria-label={isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
                        >
                          <Heart size={16} className={isFavorite ? "fill-current" : ""} />
                        </button>

                        <div className="relative flex aspect-[1.2/0.95] items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,#F6F4F8_100%)]">
                          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.92)_0%,rgba(240,238,244,0.58)_100%)]" />
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={moto.name || "Motorcycle"}
                              className="moto-float relative z-10 h-full w-full object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="relative z-10 flex h-full w-full items-center justify-center text-[#D8D4DB]">
                              <Bike size={72} strokeWidth={1.2} />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7A6E71]">
                            {moto.category?.name || moto.categoryName || "DÒNG XE"}
                          </p>
                          <h3 className="mt-2 line-clamp-2 font-teko text-[1.45rem] font-bold leading-[0.95] tracking-[-0.03em] text-[#1A1B1F]">
                            {moto.name || "IRON"}
                          </h3>
                        </div>

                        <p className="mt-2 text-lg font-medium text-[#6E4A43]">
                          {formatListingPrice(moto.price)}
                        </p>

                        <div className="mt-5 grid grid-cols-2 gap-4 border-y border-[#EEEAF1] py-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-[#7A6E71]">
                              <Zap size={12} />
                              <span className="text-xs">Công suất</span>
                            </div>
                            <p className="mt-1 text-sm font-semibold text-[#1A1B1F]">
                              {moto.horsepower ? `${moto.horsepower} HP` : "—"}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-[#7A6E71]">
                              <ShieldCheck size={12} />
                              <span className="text-xs">Dung tích</span>
                            </div>
                            <p className="mt-1 text-sm font-semibold text-[#1A1B1F]">
                              {moto.engineCc ? `${moto.engineCc} cc` : "—"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-3">
                          <p className="min-w-0 text-sm text-[#7A6E71]">
                            {moto.torque ? `Mô-men xoắn ${moto.torque} Nm` : " " }
                          </p>
                          <Link
                            to={getPagePath(moto)}
                            className="inline-flex shrink-0 items-center gap-2 rounded-[6px] border-2 border-[#1A1B1F] px-4 py-2.5 text-sm font-semibold text-[#1A1B1F] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1A1B1F] hover:text-white"
                          >
                            XEM CHI TIẾT
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}

                <div className="moto-fade flex min-h-[430px] flex-col items-center justify-center rounded-[8px] border border-dashed border-[#E3DEE6] bg-white px-6 py-10 text-center shadow-[0_12px_30px_-28px_rgba(0,0,0,0.2)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF8FC] text-[#D8D4DB]">
                    <Sparkles size={22} />
                  </div>
                  <h3 className="mt-4 font-teko text-3xl font-bold leading-none text-[#6E4A43]">
                    Sắp Ra Mắt
                  </h3>
                  <p className="mt-3 max-w-[220px] text-sm leading-6 text-[#7A6E71]">
                    Những cỗ máy tốc độ mới đang được hoàn thiện tại xưởng kỹ thuật.
                  </p>
                  <button
                    type="button"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[#BC000A] transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Đăng ký nhận thông tin
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[440px] items-center justify-center rounded-[8px] border border-dashed border-[#E3DEE6] bg-white px-6 text-center">
                <div className="max-w-md">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F0EDF4] text-[#BC000A]">
                    <Bike size={30} />
                  </div>
                  <h2 className="mt-5 font-teko text-4xl font-bold leading-none text-[#1A1B1F]">
                    Không có xe phù hợp
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#7A6E71]">
                    Thử xóa bớt bộ lọc để xem thêm các mẫu xe đang có trong cơ sở dữ liệu.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 inline-flex items-center gap-2 rounded-[6px] bg-[#BC000A] px-5 py-3 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              </div>
            )}

            {totalPages > 1 && (
              <div className="moto-hero-up mt-8 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: Math.max(prev.page - 1, 0) }))
                  }
                  disabled={filters.page === 0}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-[#6A6771] transition-all duration-300 hover:border-[#E3DEE6] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={16} />
                </button>

                {pageItems.map((pageNumber, index) =>
                  pageNumber === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="inline-flex h-10 w-10 items-center justify-center text-[#7A6E71]"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: pageNumber - 1,
                        }))
                      }
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                        pageNumber === filters.page + 1
                          ? "bg-[#BC000A] text-white shadow-[0_12px_24px_-16px_rgba(188,0,10,0.7)]"
                          : "bg-transparent text-[#1A1B1F] hover:bg-white hover:shadow-[0_12px_24px_-18px_rgba(0,0,0,0.16)]"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: Math.min(prev.page + 1, totalPages - 1),
                    }))
                  }
                  disabled={filters.page >= totalPages - 1}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-[#1A1B1F] transition-all duration-300 hover:border-[#E3DEE6] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Trang sau"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
};

export default MotorcyclePage;
