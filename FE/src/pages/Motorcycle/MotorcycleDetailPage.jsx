import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Gauge,
  ShoppingCart,
  Sparkles,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import motorcycleApi from "../../api/motorcycleApi";
import ColorSwatch from "../../components/common/ColorSwatch";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/formatCurrency";

const API_ROOT = (
  import.meta.env.VITE_API_URL || "http://localhost:8080/api"
).replace(/\/api\/?$/, "");

const STATUS_META = {
  AVAILABLE: {
    label: "Còn hàng",
    ok: true,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  OUT_OF_STOCK: {
    label: "Hết hàng",
    ok: false,
    className: "bg-red-50 text-red-600 border-red-200",
  },
  COMING_SOON: {
    label: "Sắp ra mắt",
    ok: false,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  DISCONTINUED: {
    label: "Ngừng sản xuất",
    ok: false,
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

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

const buildGallery = (moto) => {
  if (!moto) return [];

  const list = [];
  const seen = new Set();

  const pushImage = (image) => {
    const url = resolveImageUrl(image.imageUrl);
    if (!url || seen.has(url)) return;
    seen.add(url);
    list.push({ ...image, imageUrl: url });
  };

  if (moto.thumbnailUrl) {
    pushImage({
      id: "thumbnail",
      imageUrl: moto.thumbnailUrl,
      colorName: null,
      isPrimary: true,
    });
  }

  const sorted = [...(moto.images || [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );

  sorted.forEach((img) => pushImage(img));

  return list;
};

const DetailSkeleton = () => (
  <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8">
    <div className="mb-8 h-5 w-40 animate-pulse rounded bg-[#E3DEE6]" />
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <div className="space-y-4">
        <div className="aspect-[4/3] animate-pulse rounded-[24px] bg-[#E3DEE6]" />
        <div className="flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 w-20 animate-pulse rounded-[14px] bg-[#E3DEE6]"
            />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-4 w-32 animate-pulse rounded bg-[#E3DEE6]" />
        <div className="h-12 w-full animate-pulse rounded bg-[#E3DEE6]" />
        <div className="h-10 w-48 animate-pulse rounded bg-[#E3DEE6]" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-[14px] bg-[#E3DEE6]"
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const MotorcycleDetailPage = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [moto, setMoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imgAnimKey, setImgAnimKey] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const galleryImages = useMemo(() => buildGallery(moto), [moto]);
  const activeImage = galleryImages[selectedIndex] || null;

  const goToImage = useCallback(
    (index) => {
      if (!galleryImages.length) return;
      const next =
        ((index % galleryImages.length) + galleryImages.length) %
        galleryImages.length;
      setSelectedIndex(next);
      setImgAnimKey((key) => key + 1);
    },
    [galleryImages.length],
  );

  useEffect(() => {
    setLoading(true);
    motorcycleApi
      .getBySlug(slug)
      .then((res) => {
        const payload = res?.data ?? res;
        setMoto(payload);
        setSelectedIndex(0);
        setImgAnimKey(0);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") goToImage(selectedIndex + 1);
      if (event.key === "ArrowLeft") goToImage(selectedIndex - 1);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, goToImage, selectedIndex]);

  const handleAddToCart = () => {
    const totalStock = (moto?.inventories || []).reduce(
      (s, it) => s + (Number(it?.quantity) || 0),
      0,
    );

    if (moto?.inventories && moto.inventories.length > 0 && totalStock <= 0) {
      toast.error("Màu này đã hết hàng");
      return;
    }

    const payload = {
      motorcycleId: moto.id,
      name: moto.name,
      price: moto.price,
      thumbnailUrl: activeImage?.imageUrl || moto.thumbnailUrl,
      colorName: null,
    };

    // eslint-disable-next-line no-console
    console.log("MotorcycleDetailPage: adding to cart (no color)", payload);
    try {
      addItem(payload);
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error adding to cart", err);
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5FA]">
        <DetailSkeleton />
      </div>
    );
  }

  if (!moto) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#F7F5FA] px-4 text-center">
        <p className="font-teko text-4xl font-bold text-[#1A1B1F]">
          Không tìm thấy xe
        </p>
        <Link
          to="/motorcycles"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#BC000A]"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const status = STATUS_META[moto.status] || STATUS_META.OUT_OF_STOCK;

  return (
    <div className="min-h-screen bg-[#F7F5FA] pb-16 text-[#1A1B1F]">
      <style>{`
        @keyframes detailRise {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes detailImgIn {
          0% { opacity: 0; transform: scale(1.05); filter: blur(6px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes detailLightboxIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes detailThumbPop {
          0% { transform: scale(0.94); }
          100% { transform: scale(1); }
        }
        .detail-rise {
          animation: detailRise 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .detail-img-enter {
          animation: detailImgIn 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .detail-lightbox-enter {
          animation: detailLightboxIn 0.35s ease-out both;
        }
        .detail-thumb-active {
          animation: detailThumbPop 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .detail-rise,
          .detail-img-enter,
          .detail-lightbox-enter,
          .detail-thumb-active {
            animation: none !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Link
          to="/motorcycles"
          className="detail-rise mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#7A6E71] transition-colors hover:text-[#BC000A]"
        >
          <ChevronLeft size={16} />
          Quay lại danh sách
        </Link>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:gap-14">
          {/* Gallery */}
          <div
            className="detail-rise space-y-4"
            style={{ animationDelay: "60ms" }}
          >
            <div className="group/gallery relative overflow-hidden rounded-[24px] border border-[#E3DEE6] bg-white shadow-[0_24px_60px_-36px_rgba(0,0,0,0.18)]">
              <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,#F6F4F8_100%)]">
                {activeImage ? (
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="relative h-full w-full cursor-zoom-in"
                    aria-label="Phóng to ảnh"
                  >
                    <img
                      key={imgAnimKey}
                      src={activeImage.imageUrl}
                      alt={moto.name}
                      className="detail-img-enter absolute inset-0 h-full w-full object-contain p-6 sm:p-8"
                    />
                  </button>
                ) : (
                  <div className="flex h-full items-center justify-center text-[#9A9196]">
                    Chưa có ảnh
                  </div>
                )}

                {galleryImages.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => goToImage(selectedIndex - 1)}
                      className="absolute left-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#1A1B1F] opacity-0 shadow-lg backdrop-blur transition-all duration-300 hover:bg-white group-hover/gallery:opacity-100 sm:left-4"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => goToImage(selectedIndex + 1)}
                      className="absolute right-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#1A1B1F] opacity-0 shadow-lg backdrop-blur transition-all duration-300 hover:bg-white group-hover/gallery:opacity-100 sm:right-4"
                      aria-label="Ảnh sau"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                ) : null}

                {galleryImages.length > 0 ? (
                  <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[#1A1B1F]/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    {selectedIndex + 1} / {galleryImages.length}
                  </div>
                ) : null}
              </div>
            </div>

            {galleryImages.length > 1 ? (
              <div className="relative">
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                  {galleryImages.map((img, index) => {
                    const active = index === selectedIndex;
                    return (
                      <button
                        key={img.id ?? `${img.imageUrl}-${index}`}
                        type="button"
                        onClick={() => goToImage(index)}
                        className={`detail-rise relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[14px] border-2 bg-white transition-all duration-300 sm:h-[84px] sm:w-[84px] ${
                          active
                            ? "detail-thumb-active border-[#BC000A] shadow-[0_12px_28px_-16px_rgba(188,0,10,0.55)]"
                            : "border-[#E3DEE6] opacity-80 hover:border-[#BC000A]/40 hover:opacity-100"
                        }`}
                        style={{ animationDelay: `${120 + index * 50}ms` }}
                        aria-label={`Xem ảnh ${index + 1}`}
                      >
                        <img
                          src={img.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        {active ? (
                          <span className="absolute inset-x-0 bottom-0 h-1 bg-[#BC000A]" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {galleryImages.length > 3 ? (
              <section className="detail-rise rounded-[20px] border border-[#E3DEE6] bg-white p-5 shadow-[0_16px_40px_-32px_rgba(0,0,0,0.14)]">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles size={16} className="text-[#BC000A]" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#1A1B1F]">
                    Thư viện ảnh
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {galleryImages.map((img, index) => (
                    <button
                      key={`grid-${img.id ?? index}`}
                      type="button"
                      onClick={() => {
                        goToImage(index);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="group relative aspect-[4/3] overflow-hidden rounded-[14px] border border-[#EEEAF1] bg-[#FAF8FC]"
                    >
                      <img
                        src={img.imageUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-[#BC000A]/0 transition-colors duration-300 group-hover:bg-[#BC000A]/10" />
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          {/* Info */}
          <div
            className="detail-rise space-y-6"
            style={{ animationDelay: "120ms" }}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#BC000A]">
                {moto.brand?.name || moto.brandName} ·{" "}
                {moto.category?.name || moto.categoryName}
              </p>
              <h1 className="mt-3 font-teko text-[clamp(2.2rem,5vw,3.4rem)] font-bold leading-[0.95] tracking-[-0.03em]">
                {moto.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                >
                  {status.ok ? (
                    <CheckCircle size={13} />
                  ) : (
                    <XCircle size={13} />
                  )}
                  {status.label}
                </span>
                {moto.yearModel ? (
                  <span className="text-sm text-[#7A6E71]">
                    Model {moto.yearModel}
                  </span>
                ) : null}
              </div>

              <p className="mt-5 font-teko text-[clamp(2rem,4vw,2.8rem)] font-bold leading-none text-[#BC000A]">
                {formatCurrency(moto.price)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Phân khối",
                  value: moto.engineCc ? `${moto.engineCc} cc` : "—",
                  icon: Gauge,
                },
                {
                  label: "Công suất",
                  value: moto.horsepower ? `${moto.horsepower} HP` : "—",
                  icon: Zap,
                },
                {
                  label: "Mô-men xoắn",
                  value: moto.torque ? `${moto.torque} Nm` : "—",
                  icon: Sparkles,
                },
                {
                  label: "Năm sản xuất",
                  value: moto.yearModel || "—",
                  icon: Calendar,
                },
              ].map((spec, index) => (
                <div
                  key={spec.label}
                  className="detail-rise rounded-[14px] border border-[#E3DEE6] bg-white p-4 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-24px_rgba(188,0,10,0.15)]"
                  style={{ animationDelay: `${180 + index * 60}ms` }}
                >
                  <div className="flex items-center gap-2 text-[#7A6E71]">
                    <spec.icon size={14} className="text-[#BC000A]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                      {spec.label}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-bold text-[#1A1B1F]">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={moto.status !== "AVAILABLE"}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-[#BC000A] px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_40px_-24px_rgba(188,0,10,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                Thêm vào giỏ
              </button>
              <Link
                to={`/booking?motorcycleId=${moto.id}`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-[12px] border-2 border-[#1A1B1F] px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-[#1A1B1F] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1A1B1F] hover:text-white"
              >
                <Calendar size={18} />
                Lái thử
              </Link>
            </div>
          </div>
        </div>

        {moto.description ? (
          <section
            className="detail-rise mt-12 rounded-[24px] border border-[#E3DEE6] bg-white p-6 shadow-[0_20px_50px_-34px_rgba(0,0,0,0.14)] sm:p-8"
            style={{ animationDelay: "240ms" }}
          >
            <h2 className="font-teko text-3xl font-bold tracking-[-0.02em]">
              Mô tả sản phẩm
            </h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[#5E3F3B] sm:text-[15px]">
              {moto.description}
            </p>
          </section>
        ) : null}

        {moto.specifications ? (
          <section
            className="detail-rise mt-6 rounded-[24px] border border-[#E3DEE6] bg-[#FAF8FC] p-6 sm:p-8"
            style={{ animationDelay: "300ms" }}
          >
            <h2 className="font-teko text-3xl font-bold tracking-[-0.02em]">
              Thông số kỹ thuật
            </h2>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap font-sans text-sm leading-8 text-[#5E3F3B]">
              {moto.specifications}
            </pre>
          </section>
        ) : null}
      </div>

      {/* Lightbox */}
      {lightboxOpen && activeImage ? (
        <div
          className="detail-lightbox-enter fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1B1F]/92 p-4 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh phóng to"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6 sm:top-6"
            aria-label="Đóng"
          >
            <X size={22} />
          </button>

          {galleryImages.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage(selectedIndex - 1);
                }}
                className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                aria-label="Ảnh trước"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage(selectedIndex + 1);
                }}
                className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                aria-label="Ảnh sau"
              >
                <ChevronRight size={22} />
              </button>
            </>
          ) : null}

          <img
            key={`lb-${imgAnimKey}`}
            src={activeImage.imageUrl}
            alt={moto.name}
            className="detail-img-enter max-h-[85vh] max-w-[92vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-medium text-white/80">
            {selectedIndex + 1} / {galleryImages.length}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default MotorcycleDetailPage;
