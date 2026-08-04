import { useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, Mail, MapPin, PhoneCall, Send } from "lucide-react";
import toast from "react-hot-toast";
import contactImage from "../../assets/img/contact.png";

const SHOWROOMS = [
  {
    title: "IRON Hanoi (Flagship)",
    address: "123 Đường Tốc Độ, Quận Hoàn Kiếm, Hà Nội",
    phone: "+84 24 1234 5678",
    email: "hanoi@ironmotorcycles.vn",
  },
  {
    title: "IRON Ho Chi Minh",
    address: "456 Đại Lộ Gia Tốc, Quận 1, TP. HCM",
    phone: "+84 28 8765 4321",
    email: "hcm@ironmotorcycles.vn",
  },
];

const ContactPage = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error("Vui lòng điền đầy đủ họ tên, số điện thoại và email.");
      return;
    }

    toast.success("Yêu cầu của bạn đã được ghi nhận. IRON sẽ liên hệ sớm.");
    setForm({
      name: "",
      phone: "",
      email: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#F3F1F4] text-[#1A1B1F]">
      <style>{`
        @keyframes contactHeroZoom {
          0% { opacity: 0; transform: scale(1.06); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes contactRise {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes contactFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .contact-hero-image {
          animation: contactHeroZoom 1s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .contact-rise {
          animation: contactRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .contact-float {
          animation: contactFloat 6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .contact-hero-image,
          .contact-rise,
          .contact-float {
            animation: none !important;
          }
        }
      `}</style>

      <section className="relative isolate -mt-14 overflow-hidden sm:-mt-16 md:-mt-[68px]">
        <div className="relative h-[470px] sm:h-[540px]">
          <img
            src={contactImage}
            alt="Liên hệ IRON"
            className="contact-hero-image absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0.58)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_12%,rgba(0,0,0,0.12)_75%)]" />

          <div className="relative mx-auto flex h-full max-w-[1280px] items-center justify-center px-4 text-center sm:px-6 lg:px-12">
            <div className="max-w-4xl">
              <nav
                aria-label="Breadcrumb"
                className="contact-rise mb-6 flex flex-wrap items-center justify-center gap-2 text-sm text-white/80"
              >
                <Link to="/" className="transition-colors hover:text-white">
                  Trang chủ
                </Link>
                <span>/</span>
                <span className="font-semibold text-white">Liên hệ</span>
              </nav>

              <h1 className="contact-rise font-teko text-[clamp(3.1rem,8vw,5.6rem)] font-bold uppercase leading-[0.9] tracking-[-0.04em] text-white">
                Liên Hệ Với Chúng Tôi
              </h1>
              <p
                className="contact-rise mx-auto mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg"
                style={{ animationDelay: "120ms" }}
              >
                Đội ngũ chuyên gia của IRON Motorcycles luôn sẵn sàng hỗ trợ bạn
                kiến tạo trải nghiệm tốc độ đỉnh cao.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-24 pb-20 sm:-mt-28">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
            <form
              onSubmit={handleSubmit}
              className="contact-rise rounded-[28px] bg-white p-6 shadow-[0_26px_60px_-34px_rgba(0,0,0,0.22)] sm:p-8"
            >
              <div className="mb-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#BC000A]">
                  Gửi tin nhắn
                </p>
                <h2 className="mt-3 font-teko text-4xl font-semibold leading-none text-[#1A1B1F] sm:text-5xl">
                  Chúng tôi luôn sẵn sàng lắng nghe
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5E3F3B]">
                    Họ & tên
                  </span>
                  <input
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="Tên của bạn"
                    className="w-full rounded-[12px] border border-[#E7E1E4] bg-[#F7F4F6] px-4 py-3 text-sm outline-none transition-colors focus:border-[#BC000A] focus:bg-white"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5E3F3B]">
                    Số điện thoại
                  </span>
                  <input
                    value={form.phone}
                    onChange={handleChange("phone")}
                    placeholder="Số điện thoại"
                    className="w-full rounded-[12px] border border-[#E7E1E4] bg-[#F7F4F6] px-4 py-3 text-sm outline-none transition-colors focus:border-[#BC000A] focus:bg-white"
                  />
                </label>
              </div>

              <label className="mt-4 block space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5E3F3B]">
                  Email
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="Địa chỉ email"
                  className="w-full rounded-[12px] border border-[#E7E1E4] bg-[#F7F4F6] px-4 py-3 text-sm outline-none transition-colors focus:border-[#BC000A] focus:bg-white"
                />
              </label>

              <label className="mt-4 block space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5E3F3B]">
                  Nội dung
                </span>
                <textarea
                  rows={6}
                  value={form.message}
                  onChange={handleChange("message")}
                  placeholder="Bạn cần hỗ trợ gì?"
                  className="w-full resize-none rounded-[12px] border border-[#E7E1E4] bg-[#F7F4F6] px-4 py-3 text-sm outline-none transition-colors focus:border-[#BC000A] focus:bg-white"
                />
              </label>

              <button
                type="submit"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#BC000A] px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-[0_20px_40px_-24px_rgba(188,0,10,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
              >
                Gửi yêu cầu
                <Send size={16} />
              </button>
            </form>

            <div
              className="contact-rise rounded-[28px] bg-[#F7F4F6] p-6 shadow-[0_26px_60px_-34px_rgba(0,0,0,0.16)] sm:p-8"
              style={{ animationDelay: "120ms" }}
            >
              <div className="contact-float rounded-[24px] bg-white p-5 shadow-[0_22px_50px_-38px_rgba(0,0,0,0.18)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#BC000A]">
                  Chi nhánh showroom
                </p>
                <h2 className="mt-3 font-teko text-4xl font-semibold leading-none text-[#1A1B1F]">
                  Kết nối cùng IRON
                </h2>
              </div>

              <div className="mt-6 space-y-5">
                {SHOWROOMS.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[20px] border border-white/70 bg-white px-5 py-6"
                  >
                    <h3 className="text-xl font-semibold text-[#1A1B1F]">
                      {item.title}
                    </h3>

                    <div className="mt-4 space-y-3 text-sm text-[#5E3F3B]">
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="mt-0.5 text-[#BC000A]" />
                        <span>{item.address}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <PhoneCall
                          size={18}
                          className="mt-0.5 text-[#BC000A]"
                        />
                        <span>{item.phone}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail size={18} className="mt-0.5 text-[#BC000A]" />
                        <span>{item.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[20px] bg-[#EAE5E8] px-5 py-5">
                <div className="flex items-start gap-3">
                  <HelpCircle size={20} className="mt-0.5 text-[#1A1B1F]" />
                  <div>
                    <p className="text-base font-semibold text-[#1A1B1F]">
                      Hỗ trợ khẩn cấp 24/7
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#5E3F3B]">
                      Dịch vụ ưu tiên dành cho khách hàng sở hữu mô tô IRON.
                    </p>
                    <p className="mt-2 text-lg font-bold text-[#BC000A]">
                      1900 8888
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
