import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  Clock3,
  Bike,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import bookingApi from "../../api/bookingApi";
import { BOOKING_STATUS } from "../../utils/constants";
import { formatDate, formatDateTime } from "../../utils/formatDate";

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

const BookingHistoryPage = () => {
  const [data, setData] = useState({ content: [] });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    return bookingApi
      .getMyBookings({ page: 0, size: 20 })
      .then((res) => {
        const payload = res?.data ?? res;
        setData(payload || { content: [] });
      })
      .catch(() => toast.error("Không thể tải danh sách đặt lịch"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm("Bạn có chắc muốn hủy lịch lái thử này?")) return;
    try {
      await bookingApi.cancel(id);
      toast.success("Đã hủy lịch lái thử");
      load();
    } catch {
      toast.error("Không thể hủy lịch này");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5FA] pb-16 text-[#1A1B1F]">
      <style>{`
        @keyframes bookingHistoryRise {
          0% { opacity: 0; transform: translateY(22px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .booking-history-rise {
          animation: bookingHistoryRise 0.72s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .booking-history-rise { animation: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <header className="booking-history-rise mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#BC000A]">
            Tài khoản
          </p>
          <h1 className="mt-2 font-teko text-[clamp(2.4rem,5vw,3.4rem)] font-bold leading-none tracking-[-0.03em]">
            Lịch sử đặt lái thử
          </h1>
          <p className="mt-3 text-sm leading-7 text-[#7A6E71]">
            Theo dõi các lịch hẹn lái thử và trạng thái của bạn.
          </p>
        </header>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-52 animate-pulse rounded-[20px] border border-[#E3DEE6] bg-white"
              />
            ))}
          </div>
        ) : data.content?.length === 0 ? (
          <div className="booking-history-rise flex flex-col items-center rounded-[24px] border border-dashed border-[#E3DEE6] bg-white px-6 py-16 text-center shadow-[0_16px_40px_-32px_rgba(0,0,0,0.12)]">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FAF8FC] text-[#BC000A]">
              <CalendarClock size={34} strokeWidth={1.6} />
            </div>
            <h2 className="mt-6 font-teko text-4xl font-bold leading-none">
              Chưa có lịch đặt lái thử
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-7 text-[#7A6E71]">
              Bạn chưa đặt lịch lái thử xe nào. Đặt lịch ngay để trải nghiệm những
              cỗ máy tốc độ tuyệt vời nhất của IRON.
            </p>
            <Link
              to="/booking"
              className="mt-7 inline-flex items-center gap-2 rounded-[10px] bg-[#BC000A] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
            >
              Đặt lịch lái thử
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data.content.map((booking, index) => {
              const status = BOOKING_STATUS[booking.status] || {
                label: booking.status,
                color: "gray",
              };
              const badgeClass =
                STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING;
              const bookingDate = booking.bookingDate
                ? formatDate(booking.bookingDate)
                : "";
              const bookingTime = booking.bookingTime
                ? booking.bookingTime
                : "";

              return (
                <article
                  key={booking.id}
                  className="booking-history-rise overflow-hidden rounded-[20px] border border-[#E3DEE6] bg-white shadow-[0_16px_40px_-32px_rgba(0,0,0,0.14)] transition-all duration-300 hover:shadow-[0_22px_48px_-30px_rgba(0,0,0,0.18)]"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EEEAF1] px-5 py-4 sm:px-6">
                    <div>
                      <p className="font-mono text-sm font-bold text-[#BC000A]">
                        {booking.motorcycleName || "Lái thử"}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#7A6E71]">
                        <CalendarClock size={13} />
                        Đặt lúc {formatDateTime(booking.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#F7F4F6] sm:h-28 sm:w-28">
                      {booking.motorcycleThumbnail ? (
                        <img
                          src={booking.motorcycleThumbnail}
                          alt={booking.motorcycleName}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <Bike size={28} className="text-[#7A6E71]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-teko text-xl font-semibold leading-none text-[#1A1B1F]">
                        {booking.motorcycleName}
                      </h3>
                      <p className="mt-1 text-xs text-[#7A6E71]">
                        {booking.brandName
                          ? `${booking.brandName} · ${booking.motorcycleName}`
                          : booking.motorcycleName}
                      </p>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div className="flex items-center gap-1.5 text-sm text-[#5E3F3B]">
                          <CalendarDays size={14} className="text-[#BC000A]" />
                          {bookingDate || "—"}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-[#5E3F3B]">
                          <Clock3 size={14} className="text-[#BC000A]" />
                          {bookingTime || "—"}
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-[#7A6E71]">
                        {booking.customerName} · {booking.customerPhone}
                      </div>

                      {booking.note && (
                        <p className="mt-2 text-xs italic text-[#7A6E71] line-clamp-1">
                          &ldquo;{booking.note}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {booking.status === "PENDING" && (
                    <div className="border-t border-[#EEEAF1] px-5 py-3 sm:px-6">
                      <button
                        type="button"
                        onClick={() => handleCancel(booking.id)}
                        className="inline-flex items-center gap-2 rounded-[8px] border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-300 hover:bg-red-100 active:scale-95"
                      >
                        <X size={14} />
                        Hủy lịch
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistoryPage;
