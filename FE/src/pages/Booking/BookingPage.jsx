import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock3,
  MapPinned,
  PhoneCall,
  ShieldCheck,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import bookingApi from "../../api/bookingApi";
import motorcycleApi from "../../api/motorcycleApi";
import loginHero from "../../assets/img/backroud-login.jpg";

const STEP_ITEMS = [
  { id: 1, label: "Chọn Xe" },
  { id: 2, label: "Thời Gian" },
  { id: 3, label: "Thông Tin" },
];

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "TRANG BỊ AN TOÀN",
    description:
      "Mũ bảo hiểm, găng tay và áo giáp bảo hộ tiêu chuẩn quốc tế được cung cấp miễn phí.",
  },
  {
    icon: Users,
    title: "CHUYÊN GIA ĐỒNG HÀNH",
    description:
      "Hướng dẫn kỹ thuật lái xe an toàn từ các huấn luyện viên chuyên nghiệp của IRON.",
  },
  {
    icon: MapPinned,
    title: "CUNG ĐƯỜNG THIẾT KẾ RIÊNG",
    description:
      "Trải nghiệm khả năng tăng tốc, ôm cua và phanh trên các tuyến đường được chọn lọc.",
  },
];

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
  if (
    url.startsWith("/assets/") ||
    url.startsWith("/src/") ||
    url.includes("/assets/")
  ) {
    return url;
  }
  if (url.startsWith("/")) return `${API_ROOT}${url}`;
  return `${API_ROOT}/${url}`;
};

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const initialMotorcycleId = searchParams.get("motorcycleId")
    ? String(searchParams.get("motorcycleId"))
    : "";
  const [motorcycles, setMotorcycles] = useState([]);
  const [loadingMotorcycles, setLoadingMotorcycles] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedMotorcycleId, setSelectedMotorcycleId] = useState(
    initialMotorcycleId,
  );
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    motorcycleId: initialMotorcycleId,
    bookingDate: "",
    bookingTime: "09:00",
    customerName: "",
    customerPhone: "",
    note: "",
  });

  useEffect(() => {
    let alive = true;
    setLoadingMotorcycles(true);

    motorcycleApi
      .search({ page: 0, size: 24, sortBy: "createdAt", sortDir: "desc" })
      .then((res) => {
        if (!alive) return;
        const payload = normalizePayload(res);
        setMotorcycles(Array.isArray(payload) ? payload : payload?.content || []);
      })
      .catch(() => {
        if (!alive) return;
        setMotorcycles([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoadingMotorcycles(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (selectedMotorcycleId) {
      setForm((prev) => ({ ...prev, motorcycleId: selectedMotorcycleId }));
      return;
    }

    if (motorcycles.length > 0) {
      const firstId = String(motorcycles[0].id);
      setSelectedMotorcycleId(firstId);
      setForm((prev) => ({ ...prev, motorcycleId: firstId }));
    }
  }, [motorcycles, selectedMotorcycleId]);

  const displayCards = useMemo(() => {
    return motorcycles.slice(0, 3).map((moto) => {
      return {
        id: String(moto.id),
        title: moto.name || "Không có tên",
        subtitle: moto.brand?.name || moto.category?.name || "IRON",
        category: moto.category?.name || "DÒNG XE",
        image: resolveImageUrl(
          moto.thumbnailUrl || moto.imageUrl || moto.images?.[0]?.imageUrl,
        ),
      };
    });
  }, [motorcycles]);

  const selectedMotorcycle = useMemo(() => {
    return (
      motorcycles.find((moto) => String(moto.id) === String(selectedMotorcycleId)) ||
      motorcycles[0] ||
      null
    );
  }, [motorcycles, selectedMotorcycleId]);

  const today = new Date().toISOString().split("T")[0];

  const handleSelectMotorcycle = (id) => {
    setSelectedMotorcycleId(String(id));
    setForm((prev) => ({ ...prev, motorcycleId: String(id) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.motorcycleId) {
      toast.error("Vui lòng chọn xe lái thử");
      setStep(1);
      return;
    }
    if (!form.bookingDate || !form.bookingTime) {
      toast.error("Vui lòng chọn thời gian lái thử");
      setStep(2);
      return;
    }
    if (!form.customerName.trim() || !form.customerPhone.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin liên hệ");
      setStep(3);
      return;
    }

    setLoading(true);
    try {
      await bookingApi.create(form);
      toast.success("Đặt lịch lái thử thành công! Chúng tôi sẽ liên hệ xác nhận.");
      const nextMotorcycleId = initialMotorcycleId || "";
      setStep(1);
      setSelectedMotorcycleId(nextMotorcycleId);
      setForm({
        motorcycleId: nextMotorcycleId,
        bookingDate: "",
        bookingTime: "09:00",
        customerName: "",
        customerPhone: "",
        note: "",
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Đặt lịch thất bại");
    } finally {
      setLoading(false);
    }
  };

  const stepTransitionClass = "booking-step-enter";

  return (
    <div className="min-h-screen bg-[#F3F1F4] text-[#1A1B1F]">
      <style>{`
        @keyframes bookingHeroIn {
          0% { opacity: 0; transform: scale(1.03); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes bookingRise {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes bookingFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .booking-hero-in {
          animation: bookingHeroIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .booking-rise {
          animation: bookingRise 0.72s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .booking-float {
          animation: bookingFloat 7s ease-in-out infinite;
        }
        .booking-step-enter {
          animation: bookingRise 0.45s ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .booking-hero-in,
          .booking-rise,
          .booking-float,
          .booking-step-enter {
            animation: none !important;
          }
        }
      `}</style>

      <section className="relative h-[540px] overflow-hidden">
        <img
          src={loginHero}
          alt="Đăng ký lái thử"
          className="booking-hero-in absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.46)_58%,rgba(0,0,0,0.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.45)_100%)]" />

        <div className="relative mx-auto flex h-full max-w-[1280px] items-end px-4 pb-10 sm:px-6 lg:px-12">
          <div className="max-w-[640px]">
            <p className="booking-rise font-mono text-[11px] uppercase tracking-[0.3em] text-[#FFB4AA] sm:text-xs">
              ĐĂNG KÝ LÁI THỬ
            </p>
            <h1
              className="booking-rise mt-4 font-teko text-[clamp(3.5rem,8vw,5.8rem)] font-bold leading-[0.88] tracking-[-0.03em] text-white"
              style={{ animationDelay: "90ms" }}
            >
              <span className="block">TRẢI NGHIỆM SỨC</span>
              <span className="block">MẠNH</span>
              <span className="block text-[#FFB4AA]">TUYỆT ĐỐI</span>
            </h1>
            <p
              className="booking-rise mt-5 max-w-[610px] text-sm leading-7 text-white/68 sm:text-[15px]"
              style={{ animationDelay: "180ms" }}
            >
              Cảm nhận nhịp đập của động cơ, sự tinh tế trong thiết kế và khả năng
              vận hành đỉnh cao. Hãy đặt lịch hẹn để trải nghiệm những cỗ máy tốc
              độ tuyệt vời nhất của IRON.
            </p>
          </div>
        </div>
      </section>

      <section className="-mt-14 pb-16">
        <div className="mx-auto max-w-[1184px] px-4 sm:px-6 lg:px-0">
          <div className="overflow-hidden rounded-[8px] border border-white/70 bg-[#FAF9FE] shadow-[0_20px_60px_-38px_rgba(0,0,0,0.28)]">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="relative">
                  <div className="absolute left-6 right-6 top-4 hidden h-px bg-[#E3E2E7] lg:block" />
                  <div className="grid grid-cols-3 gap-3 sm:gap-6">
                    {STEP_ITEMS.map((item) => {
                      const active = step === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setStep(item.id)}
                          className="relative flex flex-col items-center gap-2 bg-[#FAF9FE] px-2 py-0 text-center"
                        >
                          <span
                            className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                              active
                                ? "bg-[#BC000A] text-white shadow-[0_10px_24px_-16px_rgba(188,0,10,0.9)]"
                                : "bg-[#E3E2E7] text-[#5E3F3B]"
                            }`}
                          >
                            {item.id}
                          </span>
                          <span
                            className={`font-mono text-[11px] uppercase tracking-[0.14em] sm:text-xs ${
                              active ? "text-[#1A1B1F]" : "text-[#5E3F3B]"
                            }`}
                          >
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8">
                  {step === 1 && (
                    <div className={stepTransitionClass}>
                      <h2 className="font-teko text-[clamp(1.9rem,3vw,2.55rem)] font-semibold leading-[1.05] text-[#1A1B1F]">
                        Bạn muốn lái thử dòng xe nào?
                      </h2>

                      {loadingMotorcycles ? (
                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <div
                              key={index}
                              className="h-[290px] animate-pulse rounded-[8px] border border-[#E3E2E7] bg-white"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                          {displayCards.map((card) => {
                            const selected = String(selectedMotorcycleId) === String(card.id);
                            return (
                              <button
                                key={card.id}
                                type="button"
                                onClick={() => handleSelectMotorcycle(card.id)}
                                className={`group flex h-full flex-col overflow-hidden rounded-[8px] border bg-[#FAF9FE] p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.2)] ${
                                  selected
                                    ? "border-[#BC000A] bg-white shadow-[0_16px_36px_-26px_rgba(188,0,10,0.2)]"
                                    : "border-[#E3E2E7]"
                                }`}
                              >
                                <div className="flex h-40 items-center justify-center overflow-hidden rounded-[6px] bg-white">
                                  <img
                                    src={card.image}
                                    alt={card.title}
                                    onError={(e) => {
                                      if (card.fallbackImage && e.currentTarget.src !== card.fallbackImage) {
                                        e.currentTarget.src = card.fallbackImage;
                                      }
                                    }}
                                    className={`booking-float h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105 ${
                                      card.category === "Adventure" ? "scale-[1.02]" : ""
                                    }`}
                                  />
                                </div>
                                <div className="mt-4 flex flex-1 flex-col">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5E3F3B]">
                                    {card.category}
                                  </p>
                                  <h3 className="mt-2 font-inter text-[13px] font-semibold leading-[18px] text-[#1A1B1F]">
                                    {card.title}
                                  </h3>
                                  <p className="mt-1 text-sm leading-5 text-[#5E3F3B]">
                                    {card.subtitle}
                                  </p>
                                </div>
                                <div
                                  className={`mt-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] ${
                                    selected ? "text-[#BC000A]" : "text-[#7A6E71]"
                                  }`}
                                >
                                  <span>{selected ? "Đang chọn" : "Chọn xe"}</span>
                                  {selected && <Check size={14} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedMotorcycleId) {
                              toast.error("Vui lòng chọn xe lái thử");
                              return;
                            }
                            setStep(2);
                          }}
                          className="inline-flex items-center gap-2 rounded-[6px] bg-[#BC000A] px-6 py-4 font-inter text-base font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-18px_rgba(188,0,10,0.55)]"
                        >
                          TIẾP TỤC
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className={stepTransitionClass}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="font-teko text-[clamp(1.9rem,3vw,2.55rem)] font-semibold leading-[1.05] text-[#1A1B1F]">
                            Chọn thời gian bạn mong muốn
                          </h2>
                          <p className="mt-2 max-w-xl text-sm leading-6 text-[#5E3F3B]">
                            Chúng tôi sẽ chuẩn bị xe, bảo hộ và đội ngũ hỗ trợ theo khung
                            giờ bạn chọn.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5E3F3B] transition-colors hover:text-[#BC000A]"
                        >
                          <ChevronLeft size={16} />
                          Quay lại
                        </button>
                      </div>

                      <div className="mt-6 grid gap-5 lg:grid-cols-2">
                        <div className="rounded-[8px] border border-[#E3E2E7] bg-white p-5">
                          <div className="flex items-center gap-2">
                            <CalendarDays size={16} className="text-[#BC000A]" />
                            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#5E3F3B]">
                              Chọn ngày
                            </p>
                          </div>
                          <input
                            type="date"
                            min={today}
                            value={form.bookingDate}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, bookingDate: e.target.value }))
                            }
                            className="mt-4 w-full rounded-[8px] border border-[#E3E2E7] bg-[#FAF9FE] px-4 py-3 text-sm outline-none transition-colors focus:border-[#BC000A]"
                          />
                          <p className="mt-3 text-xs leading-5 text-[#7A6E71]">
                            Thời gian hoạt động hằng ngày từ 08:00 đến 17:00.
                          </p>
                        </div>

                        <div className="rounded-[8px] border border-[#E3E2E7] bg-white p-5">
                          <div className="flex items-center gap-2">
                            <Clock3 size={16} className="text-[#BC000A]" />
                            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#5E3F3B]">
                              Chọn giờ
                            </p>
                          </div>
                          <div className="mt-4 grid grid-cols-4 gap-2">
                            {TIME_SLOTS.map((time) => {
                              const selected = form.bookingTime === time;
                              return (
                                <button
                                  key={time}
                                  type="button"
                                  onClick={() =>
                                    setForm((prev) => ({ ...prev, bookingTime: time }))
                                  }
                                  className={`rounded-[6px] border px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                                    selected
                                      ? "border-[#BC000A] bg-[#BC000A] text-white"
                                      : "border-[#E3E2E7] bg-[#FAF9FE] text-[#1A1B1F] hover:border-[#BC000A]"
                                  }`}
                                >
                                  {time}
                                </button>
                              );
                            })}
                          </div>
                          <div className="mt-4 rounded-[8px] bg-[#F7F4F6] px-4 py-3 text-sm text-[#5E3F3B]">
                            {selectedMotorcycle ? (
                              <>
                                Xe đã chọn:{" "}
                                <span className="font-semibold text-[#1A1B1F]">
                                  {selectedMotorcycle.name}
                                </span>
                              </>
                            ) : (
                              "Vui lòng quay lại bước 1 để chọn xe."
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5E3F3B] transition-colors hover:text-[#BC000A]"
                        >
                          <ChevronLeft size={16} />
                          Quay lại
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!form.bookingDate || !form.bookingTime) {
                              toast.error("Vui lòng chọn đầy đủ ngày và giờ");
                              return;
                            }
                            setStep(3);
                          }}
                          className="inline-flex items-center gap-2 rounded-[6px] bg-[#BC000A] px-6 py-4 font-inter text-base font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-18px_rgba(188,0,10,0.55)]"
                        >
                          TIẾP TỤC
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <form className={stepTransitionClass} onSubmit={handleSubmit}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="font-teko text-[clamp(1.9rem,3vw,2.55rem)] font-semibold leading-[1.05] text-[#1A1B1F]">
                            Nhập thông tin liên hệ
                          </h2>
                          <p className="mt-2 max-w-xl text-sm leading-6 text-[#5E3F3B]">
                            Chúng tôi sẽ gọi xác nhận lịch hẹn và chuẩn bị đầy đủ trước khi
                            bạn tới showroom.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5E3F3B] transition-colors hover:text-[#BC000A]"
                        >
                          <ChevronLeft size={16} />
                          Quay lại
                        </button>
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5E3F3B]">
                            Họ và tên
                          </span>
                          <input
                            required
                            value={form.customerName}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, customerName: e.target.value }))
                            }
                            className="w-full rounded-[8px] border border-[#E3E2E7] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#BC000A]"
                            placeholder="Nhập họ tên"
                          />
                        </label>

                        <label className="space-y-2">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5E3F3B]">
                            Số điện thoại
                          </span>
                          <input
                            required
                            type="tel"
                            value={form.customerPhone}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, customerPhone: e.target.value }))
                            }
                            className="w-full rounded-[8px] border border-[#E3E2E7] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#BC000A]"
                            placeholder="Nhập số điện thoại"
                          />
                        </label>
                      </div>

                      <label className="mt-4 block space-y-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5E3F3B]">
                          Ghi chú
                        </span>
                        <textarea
                          rows={4}
                          value={form.note}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, note: e.target.value }))
                          }
                          className="w-full resize-none rounded-[8px] border border-[#E3E2E7] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#BC000A]"
                          placeholder="Ví dụ: Tôi muốn chạy thử buổi sáng cuối tuần."
                        />
                      </label>

                      <div className="mt-6 rounded-[8px] border border-[#E3E2E7] bg-white p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5E3F3B]">
                          Thông tin đã chọn
                        </p>
                        <div className="mt-3 grid gap-3 text-sm text-[#1A1B1F] sm:grid-cols-3">
                          <div>
                            <p className="text-[#7A6E71]">Xe</p>
                            <p className="font-semibold">
                              {selectedMotorcycle?.name || "Chưa chọn"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#7A6E71]">Ngày</p>
                            <p className="font-semibold">
                              {form.bookingDate || "Chưa chọn"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#7A6E71]">Giờ</p>
                            <p className="font-semibold">
                              {form.bookingTime || "Chưa chọn"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5E3F3B] transition-colors hover:text-[#BC000A]"
                        >
                          <ChevronLeft size={16} />
                          Quay lại
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex items-center gap-2 rounded-[6px] bg-[#BC000A] px-6 py-4 font-inter text-base font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-18px_rgba(188,0,10,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT LỊCH"}
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              <aside className="border-t border-[#E3E2E7] bg-white px-6 py-8 lg:border-l lg:border-t-0 lg:px-8 lg:py-12">
                <h3 className="font-teko text-2xl font-bold leading-none text-[#1A1B1F]">
                  ĐẶC QUYỀN LÁI THỬ
                </h3>

                <div className="mt-8 space-y-6">
                  {BENEFITS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-[#E3E2E7]">
                          <Icon size={16} className="text-[#BC000A]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium uppercase tracking-[0.08em] text-[#1A1B1F]">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm leading-5 text-[#5E3F3B]">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-12 border-t border-[#E3E2E7] pt-8">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#5E3F3B]">
                    Bạn cần hỗ trợ?
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <PhoneCall size={18} className="text-[#BC000A]" />
                    <p className="text-base font-bold leading-6 text-[#BC000A]">
                      Hotline: 1800-IRON
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#5E3F3B]">
                    Đội ngũ tư vấn sẽ xác nhận lịch và hỗ trợ chuẩn bị trước khi bạn
                    đến showroom.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookingPage;
