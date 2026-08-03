import { Link, useNavigate } from "react-router-dom";
import { Globe, Mail, Phone } from "lucide-react";
import IronLogo from "../common/IronLogo";

const Footer = () => {
  const navigate = useNavigate();

  const resetHome = () => {
    navigate("/", { state: { reset: Date.now() } });
  };

  return (
    <footer className="border-t border-[#F1D98A] bg-[#FFF8DC] text-[#5F5E5E]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-20 px-6 py-20 md:px-12 lg:px-16">
        <div className="grid gap-12 xl:grid-cols-[1.5fr_1fr_1fr_1fr] xl:items-start">
          <div className="flex flex-col gap-6">
            <button
              type="button"
              onClick={resetHome}
              className="inline-flex items-center justify-center rounded-[2rem] bg-[#FFF8DC] p-6 shadow-sm shadow-black/5 w-max animate-brand-in"
              aria-label="Về trang chủ"
            >
              <IronLogo size="lg" className="animate-float" asLink={false} />
            </button>
            <p className="max-w-md text-base leading-7 font-inter text-[#5F5E5E]">
              Showroom phân phối mô tô phân khối lớn cao cấp hàng đầu Việt Nam.
              Nơi niềm đam mê và kỹ thuật hội tụ.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="mailto:contact@ironmotors.vn"
                aria-label="Email"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E8BCB6] text-[#5F5E5E] transition hover:border-iron-yellow hover:text-iron-yellow"
              >
                <Mail size={20} strokeWidth={1.5} />
              </a>
              <a
                href="tel:+84123456789"
                aria-label="Phone"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E8BCB6] text-[#5F5E5E] transition hover:border-iron-yellow hover:text-iron-yellow"
              >
                <Phone size={20} strokeWidth={1.5} />
              </a>
              <a
                href="#"
                aria-label="Website"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E8BCB6] text-[#5F5E5E] transition hover:border-iron-yellow hover:text-iron-yellow"
              >
                <Globe size={20} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          <div className="grid gap-8">
            <p className="text-[#1A1B1F] font-jetBrainsMono text-xs font-bold uppercase tracking-[0.1em]">
              LIÊN KẾT NHANH
            </p>
            <div className="grid gap-4 text-base font-inter">
              <Link
                to="/motorcycles"
                className="transition-colors hover:text-[#BC000A]"
              >
                Dòng xe mới
              </Link>
              <Link
                to="/accessories"
                className="transition-colors hover:text-[#BC000A]"
              >
                Phụ kiện chính hãng
              </Link>
              <Link
                to="/booking"
                className="transition-colors hover:text-[#BC000A]"
              >
                Lịch lái thử
              </Link>
              <Link
                to="/news"
                className="transition-colors hover:text-[#BC000A]"
              >
                Tin tức &amp; Sự kiện
              </Link>
            </div>
          </div>

          <div className="grid gap-8">
            <p className="text-[#1A1B1F] font-jetBrainsMono text-xs font-bold uppercase tracking-[0.1em]">
              HỖ TRỢ
            </p>
            <div className="grid gap-4 text-base font-inter">
              <Link
                to="/warranty"
                className="transition-colors hover:text-[#BC000A]"
              >
                Chính sách bảo hành
              </Link>
              <Link
                to="/installment"
                className="transition-colors hover:text-[#BC000A]"
              >
                Dịch vụ trả góp
              </Link>
              <Link
                to="/faq"
                className="transition-colors hover:text-[#BC000A]"
              >
                Câu hỏi thường gặp
              </Link>
              <Link
                to="/contact"
                className="transition-colors hover:text-[#BC000A]"
              >
                Liên hệ showroom
              </Link>
            </div>
          </div>

          <div className="grid gap-8">
            <p className="text-[#1A1B1F] font-jetBrainsMono text-xs font-bold uppercase tracking-[0.1em]">
              ĐỊA CHỈ SHOWROOM
            </p>
            <div className="grid gap-4 text-base font-inter">
              <p className="text-[#5F5E5E] leading-6">
                123 Racing District, Hanoi, VN
              </p>
              <p className="text-[#1A1B1F] font-bold leading-6">
                +84 123 456 789
              </p>
              <p className="text-[#5F5E5E] leading-6">contact@ironmotors.vn</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#F1D98A] pt-12">
          <div className="flex flex-col items-center justify-between gap-4 text-sm font-inter text-[#5F5E5E] sm:flex-row">
            <p className="text-center sm:text-left">
              © 2024 IRON MOTORCYCLES. ALL RIGHTS RESERVED.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-center sm:justify-end">
              <span className="hidden sm:inline">contact@ironmotors.vn</span>
              <span className="text-[#A9A8A8]">|</span>
              <span>Thiết kế đồng bộ với Iron Moto</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
