import { ArrowRight, Bike, Calendar, Heart, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const MotorcycleCard = ({
  moto,
  index = 0,
  isFavorite,
  onToggleFavorite,
  resolveImageUrl,
  formatListingPrice,
  statusMeta,
  getPagePath,
}) => {
  const imageUrl = resolveImageUrl(
    moto.thumbnailUrl || moto.imageUrl || moto.images?.[0]?.imageUrl,
  );
  const stock = moto.stock ?? 0;
  const statusKey = stock > 0 ? "AVAILABLE" : "OUT_OF_STOCK";
  const status = statusMeta[statusKey] || statusMeta.AVAILABLE;

  return (
    <article
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
          onClick={() => onToggleFavorite(moto.id)}
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
            {moto.category?.name || moto.categoryName || "Dòng xe"}
          </p>
          <h3 className="mt-2 line-clamp-2 font-heading text-[1.45rem] font-bold leading-[0.95] tracking-[-0.03em] text-[#1A1B1F]">
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

        <div className="mt-auto border-t border-[#EEEAF1] pt-4">
          <div className="flex flex-col gap-2.5">
            <Link
              to={getPagePath(moto)}
              className="group/btn inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[8px] bg-[#1A1B1F] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2b2c31] hover:shadow-[0_14px_28px_-18px_rgba(26,27,31,0.55)]"
            >
              Xem chi tiết
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover/btn:translate-x-0.5"
              />
            </Link>

            <Link
              to={`/booking?motorcycleId=${moto.id}`}
              className="group/btn inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[8px] border border-[#BC000A]/20 bg-[#FFF5F5] px-4 py-2.5 text-sm font-semibold text-[#BC000A] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#BC000A] hover:bg-[#BC000A] hover:text-white hover:shadow-[0_14px_28px_-18px_rgba(188,0,10,0.45)]"
            >
              <Calendar
                size={15}
                className="transition-transform duration-300 group-hover/btn:scale-110"
              />
              Đặt lịch lái thử
            </Link>
          </div>

          {moto.torque ? (
            <p className="mt-3 text-center text-xs text-[#9A9196]">
              Mô-men xoắn {moto.torque} Nm
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default MotorcycleCard;
