import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Lock,
  MapPin,
  MessageSquare,
  Package,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";
import orderApi from "../../api/orderApi";
import motorcycleApi from "../../api/motorcycleApi";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/formatCurrency";

const VAT_RATE = 0.1;
const SHIPPING_FEE = 0;

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(
  /\/api\/?$/,
  "",
);

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

const PAYMENT_OPTIONS = [
  {
    value: "CASH",
    label: "Tien mat",
    description: "Thanh toan khi nhan xe tai showroom",
    icon: Banknote,
  },
  {
    value: "PAYOS",
    label: "PayOS",
    description: "Thanh toan qua PayOS — quet ma QR hoac mo link",
    icon: CreditCard,
  },
];

const CheckoutPage = () => {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shippingAddress: user?.address || "",
    paymentMethod: "CASH",
    customerNote: "",
  });
  const [skipCartRedirect, setSkipCartRedirect] = useState(false);

  const subtotal = total;
  const vat = useMemo(() => Math.round(subtotal * VAT_RATE), [subtotal]);
  const grandTotal = subtotal + SHIPPING_FEE + vat;

  useEffect(() => {
    if (items.length === 0 && !skipCartRedirect) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, navigate, skipCartRedirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }
    if (!form.shippingAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ nhận xe");
      return;
    }

    for (const item of items) {
      try {
        const res = await motorcycleApi.getByIdPublic(item.motorcycleId);
        const payload = res?.data ?? res;
        const stock = payload?.stock ?? 0;
        if (item.quantity > stock) {
          toast.error(
            `Sản phẩm "${item.name}" chỉ còn ${stock} xe trong kho, không đủ số lượng đặt mua.`,
            { duration: 5000 },
          );
          return;
        }
      } catch (err) {
        const status = err?.status || err?.response?.status;
        const apiData = err?.response?.data;
        const message =
          (apiData && apiData.message) ||
          err?.message ||
          "Lỗi không xác định";
        console.error("[CHECKOUT][STOCK_CHECK] failed", {
          motorcycleId: item.motorcycleId,
          name: item.name,
          status,
          message,
          raw: err,
        });
        toast.error(
          `Không thể kiểm tra tồn kho cho "${item.name}" (HTTP ${status || "?"}: ${message}). Vui lòng thử lại.`,
        );
        return;
      }
    }

    setLoading(true);
    try {
      const orderData = {
        items: items.map((i) => ({
          motorcycleId: i.motorcycleId,
          colorName: i.colorName,
          quantity: i.quantity,
        })),
        shippingAddress: form.shippingAddress.trim(),
        paymentMethod: form.paymentMethod,
        customerNote: form.customerNote.trim(),
      };
      const res = await orderApi.create(orderData);
      const createdOrder = res.data?.data || res.data;
      const newOrderId = createdOrder.id;

      if (form.paymentMethod === "PAYOS") {
        setSkipCartRedirect(true);
        clear();
        navigate(`/payment?orderId=${newOrderId}&amount=${grandTotal}`);
        return;
      }

      clear();
      toast.success("Đặt hàng thành công!");
      navigate("/my-orders");
    } catch (err) {
      toast.error(err.message || "Đặt hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#F7F5FA] pb-16 text-[#1A1B1F]">
      <style>{`
        @keyframes checkoutRise {
          0% { opacity: 0; transform: translateY(22px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .checkout-rise {
          animation: checkoutRise 0.72s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .checkout-rise { animation: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <header className="checkout-rise mb-8 lg:mb-10">
          <Link
            to="/cart"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#7A6E71] transition-colors hover:text-[#BC000A]"
          >
            <ArrowLeft size={16} />
            Quay lại giỏ hàng
          </Link>
          <h1 className="font-teko text-[clamp(2.4rem,5vw,3.6rem)] font-bold leading-none tracking-[-0.03em]">
            Thanh toán
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7A6E71] sm:text-[15px]">
            Hoàn tất thông tin giao hàng và chọn phương thức thanh toán phù hợp.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_392px] xl:gap-8"
        >
          <div className="space-y-5">
            <section
              className="checkout-rise rounded-[20px] border border-[#E3DEE6] bg-white p-6 shadow-[0_16px_40px_-32px_rgba(0,0,0,0.16)]"
              style={{ animationDelay: "80ms" }}
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0F0] text-[#BC000A]">
                  <MapPin size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Thông tin giao hàng</h2>
                  <p className="text-sm text-[#7A6E71]">
                    {user?.fullName || "Khách hàng"} · {user?.phone || user?.email}
                  </p>
                </div>
              </div>

              <label className="block space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A6E71]">
                  Địa chỉ nhận xe *
                </span>
                <textarea
                  required
                  rows={3}
                  value={form.shippingAddress}
                  onChange={(e) =>
                    setForm({ ...form, shippingAddress: e.target.value })
                  }
                  placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố..."
                  className="w-full resize-none rounded-[12px] border border-[#E3DEE6] bg-[#FAF8FC] px-4 py-3 text-sm outline-none transition-colors focus:border-[#BC000A] focus:bg-white"
                />
              </label>
            </section>

            <section
              className="checkout-rise rounded-[20px] border border-[#E3DEE6] bg-white p-6 shadow-[0_16px_40px_-32px_rgba(0,0,0,0.16)]"
              style={{ animationDelay: "160ms" }}
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0F0] text-[#BC000A]">
                  <Banknote size={18} />
                </div>
                <h2 className="text-lg font-bold">Phương thức thanh toán</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {PAYMENT_OPTIONS.map((option) => {
                  const selected = form.paymentMethod === option.value;
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, paymentMethod: option.value })
                      }
                      className={`rounded-[14px] border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                        selected
                          ? "border-[#BC000A] bg-[#FFF5F5] shadow-[0_14px_32px_-24px_rgba(188,0,10,0.45)]"
                          : "border-[#E3DEE6] bg-[#FAF8FC] hover:border-[#BC000A]/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            selected
                              ? "bg-[#BC000A] text-white"
                              : "bg-white text-[#7A6E71]"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1A1B1F]">
                            {option.label}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[#7A6E71]">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section
              className="checkout-rise rounded-[20px] border border-[#E3DEE6] bg-white p-6 shadow-[0_16px_40px_-32px_rgba(0,0,0,0.16)]"
              style={{ animationDelay: "240ms" }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0EDF4] text-[#1A1B1F]">
                  <MessageSquare size={18} />
                </div>
                <h2 className="text-lg font-bold">Ghi chú đơn hàng</h2>
              </div>

              <textarea
                rows={3}
                value={form.customerNote}
                onChange={(e) =>
                  setForm({ ...form, customerNote: e.target.value })
                }
                placeholder="Yêu cầu thêm về thời gian giao xe, màu sơn, phụ kiện..."
                className="w-full resize-none rounded-[12px] border border-[#E3DEE6] bg-[#FAF8FC] px-4 py-3 text-sm outline-none transition-colors focus:border-[#BC000A] focus:bg-white"
              />
            </section>
          </div>

          <aside
            className="checkout-rise lg:sticky lg:top-24 lg:self-start"
            style={{ animationDelay: "120ms" }}
          >
            <div className="rounded-[20px] border border-[#E3DEE6] bg-white p-6 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.2)]">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0F0] text-[#BC000A]">
                  <Package size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Đơn hàng</h2>
                  <p className="text-sm text-[#7A6E71]">{items.length} sản phẩm</p>
                </div>
              </div>

              <div className="max-h-[280px] space-y-3 overflow-y-auto pr-1">
                {items.map((item) => {
                  const imageUrl = resolveImageUrl(item.thumbnailUrl);

                  return (
                    <div
                      key={`${item.motorcycleId}-${item.colorName}`}
                      className="flex gap-3 rounded-[12px] border border-[#EEEAF1] bg-[#FAF8FC] p-3"
                    >
                      <div className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-white">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <ShoppingBag size={18} className="text-[#D8D4DB]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold text-[#1A1B1F]">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-xs text-[#7A6E71]">
                          x{item.quantity}
                          {item.colorName ? ` · ${item.colorName}` : ""}
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#BC000A]">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <dl className="mt-5 space-y-3 border-t border-[#EEEAF1] pt-5 text-sm">
                <div className="flex items-center justify-between text-[#7A6E71]">
                  <dt>Tạm tính</dt>
                  <dd className="font-medium text-[#1A1B1F]">
                    {formatCurrency(subtotal)}
                  </dd>
                </div>
                <div className="flex items-center justify-between text-[#7A6E71]">
                  <dt>Phí giao hàng</dt>
                  <dd className="font-medium text-[#1A1B1F]">
                    {SHIPPING_FEE === 0 ? "Miễn phí" : formatCurrency(SHIPPING_FEE)}
                  </dd>
                </div>
                <div className="flex items-center justify-between text-[#7A6E71]">
                  <dt>Thuế VAT (10%)</dt>
                  <dd className="font-medium text-[#1A1B1F]">
                    {formatCurrency(vat)}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex items-end justify-between border-t border-[#EEEAF1] pt-5">
                <p className="text-sm font-semibold">Tổng cộng</p>
                <p className="font-teko text-[2rem] font-bold leading-none text-[#BC000A]">
                  {formatCurrency(grandTotal)}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center rounded-[12px] bg-[#BC000A] px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-[0_20px_44px_-26px_rgba(188,0,10,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
              </button>

              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#9A9196]">
                <Lock size={13} />
                Thanh toán bảo mật 256-bit SSL
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
