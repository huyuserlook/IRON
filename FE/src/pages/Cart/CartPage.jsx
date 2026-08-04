import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Lock,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import motorcycleApi from "../../api/motorcycleApi";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/formatCurrency";

const VAT_RATE = 0.1;
const SHIPPING_FEE = 0;

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(
  /\/api\/?$/,
  "",
);

const normalizePayload = (res) => res?.data ?? res;

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

const itemKey = (item) => `${item.motorcycleId}-${item.colorName || "default"}`;

const CartPage = () => {
  const { items, total, removeItem, updateQty } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [removingKey, setRemovingKey] = useState(null);
  const [suggested, setSuggested] = useState([]);
  const [totalPulse, setTotalPulse] = useState(false);

  const cartIds = useMemo(
    () => new Set(items.map((item) => String(item.motorcycleId))),
    [items],
  );

  useEffect(() => {
    let alive = true;

    motorcycleApi
      .search({ page: 0, size: 12, sortBy: "createdAt", sortDir: "desc" })
      .then((res) => {
        if (!alive) return;
        const payload = normalizePayload(res);
        const list = Array.isArray(payload) ? payload : payload?.content || [];
        setSuggested(
          list.filter((moto) => !cartIds.has(String(moto.id))).slice(0, 3),
        );
      })
      .catch(() => {
        if (!alive) return;
        setSuggested([]);
      });

    return () => {
      alive = false;
    };
  }, [cartIds]);

  useEffect(() => {
    setTotalPulse(true);
    const timer = setTimeout(() => setTotalPulse(false), 450);
    return () => clearTimeout(timer);
  }, [total, discount, items.length]);

  const subtotal = total;
  const vat = Math.round(subtotal * VAT_RATE);
  const grandTotal = Math.max(subtotal + SHIPPING_FEE + vat - discount, 0);

  const handleRemove = (item) => {
    const key = itemKey(item);
    setRemovingKey(key);
    window.setTimeout(() => {
      removeItem(item.motorcycleId, item.colorName);
      setRemovingKey(null);
    }, 320);
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();

    if (!code) {
      toast.error("Vui lòng nhập mã giảm giá.");
      return;
    }

    if (code === "IRON10") {
      const nextDiscount = Math.round(subtotal * 0.1);
      setDiscount(nextDiscount);
      toast.success("Áp dụng mã IRON10 thành công — giảm 10%.");
      return;
    }

    if (code === "IRON500K") {
      setDiscount(500000);
      toast.success("Áp dụng mã IRON500K — giảm 500.000đ.");
      return;
    }

    toast.error("Mã giảm giá không hợp lệ.");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F5FA] text-[#1A1B1F]">
        <style>{`
          @keyframes cartEmptyIn {
            0% { opacity: 0; transform: translateY(20px) scale(0.98); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes cartEmptyFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .cart-empty-in { animation: cartEmptyIn 0.75s cubic-bezier(0.22, 1, 0.36, 1) both; }
          .cart-empty-float { animation: cartEmptyFloat 5s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) {
            .cart-empty-in, .cart-empty-float { animation: none !important; }
          }
        `}</style>

        <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
          <div className="cart-empty-in cart-empty-float flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-[0_24px_60px_-34px_rgba(0,0,0,0.18)]">
            <ShoppingCart size={40} className="text-[#BC000A]" strokeWidth={1.6} />
          </div>
          <h1 className="cart-empty-in mt-8 font-teko text-5xl font-bold leading-none tracking-[-0.03em]">
            Giỏ hàng trống
          </h1>
          <p
            className="cart-empty-in mt-4 text-sm leading-7 text-[#7A6E71]"
            style={{ animationDelay: "80ms" }}
          >
            Bạn chưa thêm xe nào vào giỏ. Khám phá bộ sưu tập IRON và chọn mẫu
            xe phù hợp với phong cách của bạn.
          </p>
          <Link
            to="/motorcycles"
            className="cart-empty-in mt-8 inline-flex items-center gap-2 rounded-[10px] bg-[#BC000A] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(188,0,10,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
            style={{ animationDelay: "160ms" }}
          >
            Khám phá dòng xe
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5FA] text-[#1A1B1F] pb-16">
      <style>{`
        @keyframes cartRise {
          0% { opacity: 0; transform: translateY(22px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes cartRemove {
          0% { opacity: 1; transform: translateX(0) scale(1); max-height: 220px; margin-bottom: 16px; }
          100% { opacity: 0; transform: translateX(24px) scale(0.98); max-height: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0; }
        }
        @keyframes cartTotalPulse {
          0% { transform: scale(1); }
          45% { transform: scale(1.04); color: #BC000A; }
          100% { transform: scale(1); }
        }
        @keyframes cartQtyPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.18); }
          100% { transform: scale(1); }
        }
        .cart-rise {
          animation: cartRise 0.72s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .cart-item-removing {
          animation: cartRemove 0.32s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          overflow: hidden;
        }
        .cart-total-pulse {
          animation: cartTotalPulse 0.45s ease-out;
        }
        .cart-qty-pop {
          animation: cartQtyPop 0.28s ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .cart-rise,
          .cart-item-removing,
          .cart-total-pulse,
          .cart-qty-pop {
            animation: none !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <header className="cart-rise mb-8 lg:mb-10">
          <h1 className="font-teko text-[clamp(2.4rem,5vw,3.6rem)] font-bold leading-none tracking-[-0.03em] text-[#1A1B1F]">
            Giỏ hàng của bạn
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7A6E71] sm:text-[15px]">
            Xem lại các lựa chọn trước khi tiến hành thanh toán.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_392px] xl:gap-8">
          <div className="space-y-4">
            {items.map((item, index) => {
              const key = itemKey(item);
              const isRemoving = removingKey === key;
              const imageUrl = resolveImageUrl(item.thumbnailUrl);

              return (
                <article
                  key={key}
                  className={`cart-rise relative overflow-hidden rounded-[16px] border border-[#E3DEE6] bg-white p-4 shadow-[0_16px_40px_-32px_rgba(0,0,0,0.18)] transition-shadow duration-300 hover:shadow-[0_22px_48px_-30px_rgba(0,0,0,0.2)] sm:p-5 ${
                    isRemoving ? "cart-item-removing" : ""
                  }`}
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#9A9196] transition-all duration-300 hover:bg-[#FFF0F0] hover:text-[#BC000A] active:scale-95"
                    aria-label="Xóa sản phẩm"
                  >
                    <X size={16} />
                  </button>

                  <div className="flex gap-4 sm:gap-5">
                    <div className="flex h-[88px] w-[112px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-[#EEEAF1] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6F4F8_100%)] sm:h-[96px] sm:w-[128px]">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <ShoppingBag size={28} className="text-[#D8D4DB]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pr-8">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9A9196]">
                        Dòng xe
                      </p>
                      <h2 className="mt-1 font-teko text-[1.35rem] font-bold leading-[0.95] tracking-[-0.02em] text-[#1A1B1F] sm:text-[1.5rem]">
                        {item.name}
                      </h2>
                      {item.colorName ? (
                        <p className="mt-1.5 text-sm text-[#7A6E71]">
                          Màu: {item.colorName}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-[10px] border border-[#E3DEE6] bg-[#FAF8FC] p-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateQty(
                                item.motorcycleId,
                                item.colorName,
                                item.quantity - 1,
                              )
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-[#1A1B1F] transition-all duration-200 hover:bg-white hover:shadow-sm active:scale-95"
                            aria-label="Giảm số lượng"
                          >
                            <Minus size={14} />
                          </button>
                          <span
                            key={item.quantity}
                            className="cart-qty-pop min-w-[2rem] px-1 text-center text-sm font-semibold text-[#1A1B1F]"
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQty(
                                item.motorcycleId,
                                item.colorName,
                                item.quantity + 1,
                              )
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-[#1A1B1F] transition-all duration-200 hover:bg-white hover:shadow-sm active:scale-95"
                            aria-label="Tăng số lượng"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <p className="text-base font-bold text-[#1A1B1F] sm:text-lg">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside
            className="cart-rise lg:sticky lg:top-24 lg:self-start"
            style={{ animationDelay: "120ms" }}
          >
            <div className="rounded-[20px] border border-[#E3DEE6] bg-white p-6 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.2)]">
              <h2 className="text-lg font-bold text-[#1A1B1F]">Tổng đơn hàng</h2>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4 text-[#7A6E71]">
                  <dt>Tạm tính</dt>
                  <dd className="font-medium text-[#1A1B1F]">
                    {formatCurrency(subtotal)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 text-[#7A6E71]">
                  <dt>Phí giao hàng dự kiến</dt>
                  <dd className="font-medium text-[#1A1B1F]">
                    {SHIPPING_FEE === 0
                      ? "Miễn phí"
                      : formatCurrency(SHIPPING_FEE)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 text-[#7A6E71]">
                  <dt>Thuế VAT (10%)</dt>
                  <dd className="font-medium text-[#1A1B1F]">
                    {formatCurrency(vat)}
                  </dd>
                </div>
                {discount > 0 ? (
                  <div className="flex items-center justify-between gap-4 text-[#BC000A]">
                    <dt>Giảm giá</dt>
                    <dd className="font-medium">-{formatCurrency(discount)}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-5 border-t border-[#EEEAF1] pt-5">
                <div className="flex items-end justify-between gap-4">
                  <p className="text-sm font-semibold text-[#1A1B1F]">
                    Tổng cộng
                  </p>
                  <p
                    className={`text-right font-teko text-[2rem] font-bold leading-none text-[#BC000A] ${
                      totalPulse ? "cart-total-pulse" : ""
                    }`}
                  >
                    {formatCurrency(grandTotal)}
                  </p>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#9A9196]">
                  Chưa bao gồm phí đăng ký biển số (nếu có).
                </p>
              </div>

              <div className="mt-6">
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7A6E71]">
                  Mã giảm giá
                </label>
                <div className="mt-2 flex gap-2">
                  <div className="relative flex-1">
                    <Tag
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#BC000A]/70"
                    />
                    <input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Nhập mã..."
                      className="w-full rounded-[10px] border border-[#E3DEE6] bg-[#FAF8FC] py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-[#BC000A] focus:bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="shrink-0 rounded-[10px] border border-[#E3DEE6] bg-white px-4 py-2.5 text-sm font-semibold text-[#1A1B1F] transition-all duration-300 hover:border-[#BC000A] hover:text-[#BC000A] active:scale-95"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-6 inline-flex w-full items-center justify-center rounded-[12px] bg-[#BC000A] px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-[0_20px_44px_-26px_rgba(188,0,10,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]"
              >
                Tiến hành thanh toán
              </Link>

              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#9A9196]">
                <Lock size={13} />
                Thanh toán bảo mật 256-bit SSL
              </p>
            </div>
          </aside>
        </div>

        {suggested.length > 0 ? (
          <section
            className="cart-rise mt-14 border-t border-[#E3DEE6] pt-10"
            style={{ animationDelay: "220ms" }}
          >
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#BC000A]">
                  Gợi ý thêm
                </p>
                <h2 className="mt-2 font-teko text-3xl font-bold leading-none tracking-[-0.02em] text-[#1A1B1F] sm:text-4xl">
                  Sản phẩm gợi ý
                </h2>
              </div>
              <Link
                to="/motorcycles"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#BC000A] transition-transform duration-300 hover:-translate-y-0.5"
              >
                Xem thêm dòng xe
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {suggested.map((moto, index) => {
                const imageUrl = resolveImageUrl(moto.thumbnailUrl);

                return (
                  <Link
                    key={moto.id}
                    to={`/motorcycles/${moto.slug}`}
                    className="cart-rise group overflow-hidden rounded-[16px] border border-[#E3DEE6] bg-white shadow-[0_16px_40px_-32px_rgba(0,0,0,0.16)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-28px_rgba(188,0,10,0.18)]"
                    style={{ animationDelay: `${280 + index * 90}ms` }}
                  >
                    <div className="relative flex h-[180px] items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,#F6F4F8_100%)]">
                      <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#BC000A] shadow-sm">
                        <Sparkles size={11} />
                        Gợi ý
                      </div>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={moto.name}
                          className="h-full w-full object-contain p-5 transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <ShoppingBag size={32} className="text-[#D8D4DB]" />
                      )}
                    </div>
                    <div className="border-t border-[#EEEAF1] p-5">
                      <p className="line-clamp-2 text-base font-semibold text-[#1A1B1F]">
                        {moto.name}
                      </p>
                      <p className="mt-2 text-lg font-bold text-[#BC000A]">
                        {formatCurrency(moto.price)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default CartPage;
