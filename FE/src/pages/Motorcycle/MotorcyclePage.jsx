import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import brandApi from "../../api/brandApi";
import categoryApi from "../../api/categoryApi";
import motorcycleApi from "../../api/motorcycleApi";
import { useDebounce } from "../../hooks/useDebounce";
import MotorcycleFilter from "../../components/motorcycle/MotorcycleFilter";
import MotorcycleGrid from "../../components/motorcycle/MotorcycleGrid";
import bmwImage from "../../assets/img/BMW.png";
import cbrImage from "../../assets/img/cbr.png";
import ducatiImage from "../../assets/img/ducati.png";

const PAGE_SIZE = 6;

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
  AVAILABLE: { label: "Mới", className: "bg-[#BC000A] text-white" },
  OUT_OF_STOCK: { label: "Hết hàng", className: "bg-[#1A1B1F] text-white" },
  DISCONTINUED: { label: "Ngừng SX", className: "bg-[#F0EDF4] text-[#5F5E5E]" },
};

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(
  /\/api\/?$/,
  "",
);

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

  // Sync keyword from URL (e.g. from Header SearchBar) into filter state
  useEffect(() => {
    const kw = searchParams.get("keyword") || "";
    setFilters((prev) => {
      if (prev.keyword === kw) return prev;
      return { ...prev, keyword: kw, page: 0 };
    });
  }, [searchParams]);

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
        engineBands.find((band) => band.key === filters.engineBand)?.min ?? undefined,
      engineCcMax:
        engineBands.find((band) => band.key === filters.engineBand)?.max ?? undefined,
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
        const base = Array.isArray(payload) ? { content: payload, totalPages: 0, totalElements: payload.length } : (payload || { content: [], totalPages: 0, totalElements: 0 });
        const filtered = base.content.filter((item) => item?.status !== "COMING_SOON");
        setData({
          ...base,
          content: filtered,
          totalElements: filtered.length,
        });
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

  const activeFilterCount = [
    filters.keyword,
    filters.brandId,
    filters.categoryId,
    filters.engineBand,
    filters.minPrice !== null,
    filters.maxPrice !== null,
  ].filter(Boolean).length;

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 0,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      keyword: "",
      brandId: "",
      categoryId: "",
      engineBand: "",
      minPrice: null,
      maxPrice: null,
      page: 0,
    }));
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

  return (
    <div className="min-h-screen bg-[#F7F5FA] text-[#1A1B1F]">
      <style>{`
        @keyframes motoFade {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes motoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .moto-fade {
          animation: motoFade 0.55s ease-out both;
        }
        .moto-float {
          animation: motoFloat 6s ease-in-out infinite;
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
          .moto-fade,
          .moto-float {
            animation: none !important;
          }
          .moto-range {
            transition: none !important;
          }
        }
      `}</style>

      <section className="border-b border-[#E8E3EC] bg-white overflow-hidden">
        <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_460px] xl:grid-cols-[minmax(0,1fr)_520px]">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#BC000A]">
                BỘ SƯU TẬP
              </p>
              <h1 className="mt-3 font-teko text-[clamp(3.2rem,7vw,5.4rem)] font-bold leading-[0.88] tracking-[-0.04em] text-[#1A1B1F]">
                DÒNG XE IRON
              </h1>
              <p className="mt-4 max-w-[760px] text-sm leading-7 text-[#7A6E71] sm:text-[15px]">
                Khám phá các mẫu superbike, cruiser và adventure theo đúng nhu cầu
                sử dụng. Bộ lọc bên trái cho phép thu hẹp theo hãng xe, mức giá và
                dung tích để so sánh nhanh hơn.
              </p>
            </div>

            <div className="moto-fade relative hidden h-[300px] lg:block" style={{ animationDelay: "120ms" }}>
              <div className="absolute right-8 top-2 h-40 w-40 rounded-full bg-[#F9D7D7] blur-3xl opacity-80" />
              <div className="absolute bottom-0 left-6 h-36 w-36 rounded-full bg-[#EAE5F3] blur-3xl opacity-90" />

              <div className="relative h-full">
                <div className="moto-float absolute left-0 top-12 flex h-[180px] w-[250px] items-center justify-center rounded-[28px] border border-[#EEE7EB] bg-[#FAF8FC] p-4 shadow-[0_22px_50px_-36px_rgba(0,0,0,0.22)]">
                  <img
                    src={ducatiImage}
                    alt="Ducati"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div
                  className="moto-float absolute right-0 top-0 flex h-[190px] w-[280px] items-center justify-center rounded-[32px] border border-[#F0E6E8] bg-white p-4 shadow-[0_28px_60px_-34px_rgba(0,0,0,0.2)]"
                  style={{ animationDelay: "900ms" }}
                >
                  <img
                    src={bmwImage}
                    alt="BMW"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div
                  className="moto-float absolute bottom-0 right-14 flex h-[170px] w-[240px] items-center justify-center rounded-[28px] border border-[#EEE7EB] bg-[#FFF7F7] p-4 shadow-[0_24px_55px_-34px_rgba(188,0,10,0.25)]"
                  style={{ animationDelay: "1600ms" }}
                >
                  <img
                    src={cbrImage}
                    alt="Honda CBR"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[292px_minmax(0,1fr)]">
          <MotorcycleFilter
            brands={brands}
            categories={categories}
            listingItems={data.content}
            filters={filters}
            setFilter={setFilter}
            clearFilters={clearFilters}
            filteredCount={filteredCount}
            activeFilterCount={activeFilterCount}
            engineBands={engineBands}
            activePriceBounds={activePriceBounds}
            minPriceValue={minPriceValue}
            maxPriceValue={maxPriceValue}
            minPercent={minPercent}
            maxPercent={maxPercent}
            formatListingPrice={formatListingPrice}
          />

          <MotorcycleGrid
            data={data}
            loading={loading}
            filters={filters}
            setFilters={setFilters}
            pageSize={PAGE_SIZE}
            itemsOnPage={itemsOnPage}
            filteredCount={filteredCount}
            activeFilterCount={activeFilterCount}
            sortOptions={sortOptions}
            pageItems={pageItems}
            totalPages={totalPages}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            resolveImageUrl={resolveImageUrl}
            formatListingPrice={formatListingPrice}
            statusMeta={statusMeta}
          />
        </div>
      </section>
    </div>
  );
};

export default MotorcyclePage;
