import { Check, SlidersHorizontal } from "lucide-react";

const MotorcycleFilter = ({
  brands,
  categories,
  listingItems,
  filters,
  setFilter,
  clearFilters,
  filteredCount,
  activeFilterCount,
  engineBands,
  activePriceBounds,
  minPriceValue,
  maxPriceValue,
  minPercent,
  maxPercent,
  formatListingPrice,
}) => {
  return (
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
                    <span className="truncate text-sm font-medium">{category.name}</span>
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
                setFilter("minPrice", Math.min(nextMin, maxPriceValue));
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
                setFilter("maxPrice", Math.max(nextMax, minPriceValue));
              }}
              className="moto-range absolute inset-x-0 top-1/2 z-20 w-full -translate-y-1/2 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)] items-center gap-2">
            <div className="min-w-0 rounded-[8px] border border-[#E6E1E8] bg-[#FBFAFC] px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A6E71]">Từ</p>
              <p className="truncate text-sm font-semibold text-[#1A1B1F]">
                {formatListingPrice(minPriceValue)}
              </p>
            </div>
            <div className="text-center text-sm text-[#7A6E71]">-</div>
            <div className="min-w-0 rounded-[8px] border border-[#E6E1E8] bg-[#FBFAFC] px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A6E71]">Đến</p>
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
              const count = (listingItems || []).filter((item) => {
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
  );
};

export default MotorcycleFilter;
