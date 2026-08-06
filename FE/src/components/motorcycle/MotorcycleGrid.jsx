import { Bike, ChevronDown, ChevronLeft, ChevronRight, Search, Sparkles } from "lucide-react";
import MotorcycleCard from "./MotorcycleCard";

const MotorcycleGrid = ({
  data,
  loading,
  filters,
  setFilters,
  pageSize,
  itemsOnPage,
  filteredCount,
  activeFilterCount,
  sortOptions,
  pageItems,
  totalPages,
  favorites,
  toggleFavorite,
  resolveImageUrl,
  formatListingPrice,
  statusMeta,
}) => {
  const getPagePath = (moto) => {
    if (!moto?.slug) return "/motorcycles";
    return `/motorcycles/${moto.slug}`;
  };

  return (
    <section className="min-w-0">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="moto-fade" style={{ animationDelay: "40ms" }}>
          <p className="text-sm font-medium text-[#1A1B1F]">
            Hiển thị {itemsOnPage} trên {filteredCount} kết quả
          </p>
          <p className="mt-1 text-xs text-[#7A6E71]">
            {activeFilterCount > 0
              ? `${activeFilterCount} bộ lọc đang áp dụng`
              : "Toàn bộ danh mục đang hiển thị"}
          </p>
        </div>

        <div className="moto-fade flex items-center gap-3" style={{ animationDelay: "100ms" }}>
          <div className="relative hidden sm:block">
            <input
              type="text"
              value={filters.keyword || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  keyword: e.target.value,
                  page: 0,
                }))
              }
              placeholder="Tìm kiếm xe..."
              className="w-full rounded-full border border-[#E3DEE6] bg-[#F7F5FA] px-3 py-1.5 text-xs text-[#1A1B1F] outline-none placeholder-[#D8D4DB] transition-colors focus:border-[#BC000A] focus:bg-white"
            />
            <Search
              size={12}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9A9196]"
            />
          </div>
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
          {Array.from({ length: pageSize }).map((_, index) => (
            <div
              key={index}
              className="h-[520px] animate-pulse rounded-[8px] border border-[#E3DEE6] bg-white"
            />
          ))}
        </div>
      ) : data.content?.length ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.content.map((moto, index) => {
              const isFavorite = favorites.has(moto.id);

              return (
                <MotorcycleCard
                  key={moto.id}
                  moto={moto}
                  index={index}
                  isFavorite={isFavorite}
                  onToggleFavorite={toggleFavorite}
                  resolveImageUrl={resolveImageUrl}
                  formatListingPrice={formatListingPrice}
                  statusMeta={statusMeta}
                  getPagePath={getPagePath}
                />
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
                Những mẫu xe tốc độ mới đang được hoàn thiện tại xưởng kỹ thuật.
              </p>
              <button
                type="button"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[#BC000A] transition-transform duration-300 hover:-translate-y-0.5"
              >
                Đăng ký nhận thông tin
              </button>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="moto-fade mt-8 flex flex-wrap items-center justify-center gap-2">
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
        </>
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
              onClick={() =>
                setFilters({
                  keyword: "",
                  brandId: "",
                  categoryId: "",
                  engineBand: "",
                  minPrice: null,
                  maxPrice: null,
                  page: 0,
                  size: pageSize,
                  sortBy: "createdAt",
                  sortDir: "desc",
                })
              }
              className="mt-6 inline-flex items-center gap-2 rounded-[6px] bg-[#BC000A] px-5 py-3 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default MotorcycleGrid;
