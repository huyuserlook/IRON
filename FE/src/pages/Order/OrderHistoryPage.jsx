import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  Package,
  Receipt,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";
import orderApi from "../../api/orderApi";
import { ORDER_STATUS } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-violet-50 text-violet-700 border-violet-200",
  SHIPPING: "bg-orange-50 text-orange-700 border-orange-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  REFUNDED: "bg-gray-100 text-gray-600 border-gray-200",
};

const OrderHistoryPage = () => {
  const [data, setData] = useState({ content: [] });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    return orderApi
      .getMyOrders({ page: 0, size: 20 })
      .then((res) => {
        const payload = res?.data ?? res;
        setData(payload || { content: [] });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    try {
      await orderApi.cancel(id);
      toast.success("Đã hủy đơn hàng");
      load();
    } catch {
      toast.error("Không thể hủy đơn hàng này");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5FA] pb-16 text-[#1A1B1F]">
      <style>{`
        @keyframes orderRise {
          0% { opacity: 0; transform: translateY(22px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .order-rise {
          animation: orderRise 0.72s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .order-rise { animation: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <header className="order-rise mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#BC000A]">
            Tài khoản
          </p>
          <h1 className="mt-2 font-teko text-[clamp(2.4rem,5vw,3.4rem)] font-bold leading-none tracking-[-0.03em]">
            Đơn hàng của tôi
          </h1>
          <p className="mt-3 text-sm leading-7 text-[#7A6E71]">
            Theo dõi trạng thái và lịch sử các đơn hàng xe IRON của bạn.
          </p>
        </header>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-[20px] border border-[#E3DEE6] bg-white"
              />
            ))}
          </div>
        ) : data.content?.length === 0 ? (
          <div className="order-rise flex flex-col items-center rounded-[24px] border border-dashed border-[#E3DEE6] bg-white px-6 py-16 text-center shadow-[0_16px_40px_-32px_rgba(0,0,0,0.12)]">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FAF8FC] text-[#BC000A]">
              <Receipt size={34} strokeWidth={1.6} />
            </div>
            <h2 className="mt-6 font-teko text-4xl font-bold leading-none">
              Chưa có đơn hàng
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-7 text-[#7A6E71]">
              Bạn chưa đặt xe nào. Khám phá bộ sưu tập IRON và bắt đầu hành
              trình của mình.
            </p>
            <Link
              to="/motorcycles"
              className="mt-7 inline-flex items-center gap-2 rounded-[10px] bg-[#BC000A] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
            >
              Xem dòng xe
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data.content.map((order, index) => {
              const status = ORDER_STATUS[order.status] || {
                label: order.status,
                color: "gray",
              };
              const badgeClass =
                STATUS_STYLES[order.status] || STATUS_STYLES.REFUNDED;

              return (
                <article
                  key={order.id}
                  className="order-rise overflow-hidden rounded-[20px] border border-[#E3DEE6] bg-white shadow-[0_16px_40px_-32px_rgba(0,0,0,0.14)] transition-all duration-300 hover:shadow-[0_22px_48px_-30px_rgba(0,0,0,0.18)]"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EEEAF1] px-5 py-4 sm:px-6">
                    <div>
                      <p className="font-mono text-sm font-bold text-[#BC000A]">
                        {order.orderCode}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#7A6E71]">
                        <CalendarClock size={13} />
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="space-y-3 px-5 py-4 sm:px-6">
                    {order.items?.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-start justify-between gap-4 rounded-[12px] bg-[#FAF8FC] px-4 py-3"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#BC000A]">
                            <ShoppingBag size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1A1B1F]">
                              {item.motorcycleName}
                            </p>
                            <p className="mt-0.5 text-xs text-[#7A6E71]">
                              x{item.quantity}
                              {item.colorName ? ` · Màu ${item.colorName}` : ""}
                            </p>
                          </div>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-[#1A1B1F]">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEEAF1] bg-[#FAFAFB] px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-[#7A6E71]" />
                      <span className="text-sm text-[#7A6E71]">Tổng thanh toán</span>
                      <span className="font-teko text-2xl font-bold text-[#BC000A]">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>

                    {order.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => handleCancel(order.id)}
                        className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-300 hover:bg-red-100 active:scale-95"
                      >
                        Hủy đơn
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
