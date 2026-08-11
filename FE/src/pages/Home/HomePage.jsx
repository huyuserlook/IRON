import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import motorcycleApi from "../../api/motorcycleApi";
import brandApi from "../../api/brandApi";
import { formatCurrency } from "../../utils/formatCurrency";
import HomeHero from "../../components/home/HomeHero";
import showImage from "../../assets/img/show.png";
import { ShieldCheck, Zap, Award, Users, ArrowRight } from "lucide-react";

const HomePage = () => {
  const location = useLocation();
  const [featured, setFeatured] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    motorcycleApi
      .search({ page: 0, size: 8, sortBy: "createdAt", sortDir: "desc" })
      .then((res) => {
        const payload = res?.data ?? res;
        const items = Array.isArray(payload) ? payload : payload?.content || [];
        setFeatured(items);
      });

    brandApi.getAll().then((res) => {
      const payload = res?.data ?? res;
      const items = Array.isArray(payload) ? payload : payload || [];
      setBrands(items);
    });
  }, []);

  useEffect(() => {
    if (location.state?.reset) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.state?.reset]);

  useEffect(() => {
    if (!location.hash) return;
    const hash = location.hash.replace("#", "");
    const el = document.getElementById(hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  return (
    <div className="bg-white">
      <HomeHero resetTrigger={location.state?.reset} />
      {/* Motorcycle Lines */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-[#BC000A] text-sm font-bold uppercase tracking-[0.24em] mb-10">
            Hãng xe
          </p>
          <div className="flex flex-wrap justify-center gap-4 xl:gap-6">
            {brands.map((brand, index) => (
              <Link
                key={brand.id}
                to={`/motorcycles?brandId=${brand.id}`}
                className="group inline-flex min-h-[120px] min-w-[160px] items-center justify-center rounded-[32px] bg-white px-6 py-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-[#FFF8E6] hover:shadow-[0_16px_40px_-24px_rgba(188,0,10,0.35)]"
                style={{
                  animation: "fadeInUp 0.8s ease-out both",
                  animationDelay: `${index * 80}ms`,
                }}
              >
                <span className="text-lg font-semibold uppercase tracking-[0.2em] text-[#6B6B6B] transition-all duration-300 group-hover:text-[#BC000A]">
                  {(brand.name || "").trim()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="mb-12 text-center">
            <p className="text-[#BC000A] font-jetBrainsMono text-xs font-semibold uppercase tracking-[0.3em] mb-4">
              LATEST ARRIVALS
            </p>
            <h2 className="text-4xl md:text-[4.5rem] font-archivoNarrow font-bold tracking-[-0.03em] text-[#1A1B1F] leading-[1.05]">
              MẪU XE MỚI NHẤT
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((moto, index) => (
              <article
                key={moto.id}
                className="group relative overflow-hidden rounded-[24px] border border-[#E8BCB6] bg-[#FAF9FE] shadow-[0_30px_80px_-55px_rgba(0,0,0,0.25)] transition-all duration-700 ease-out hover:-translate-y-3 hover:shadow-[0_40px_90px_-45px_rgba(188,0,10,0.18)]"
                style={{
                  animation: "fadeInUp 0.8s ease-out both",
                  animationDelay: `${index * 120}ms`,
                }}
              >
                <Link to={`/motorcycles/${moto.slug}`} className="block no-underline">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={moto.thumbnailUrl || "/placeholder-bike.jpg"}
                      alt={moto.name}
                      className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-0"
                    />
                    <img
                      src={moto.imageUrl || moto.thumbnailUrl || "/placeholder-bike.jpg"}
                      alt={moto.name}
                      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-[#BC000A] px-3 py-1">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-white font-jetBrainsMono font-semibold">
                        MỚI VỀ
                      </p>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-[#1A1B1F] tracking-[-0.01em] truncate">
                          {moto.name}
                        </h3>
                        <p className="mt-1.5 text-[11px] uppercase tracking-[0.2em] text-[#5F5E5E] font-jetBrainsMono truncate">
                          {moto.brandName}
                        </p>
                      </div>
                      <p className="text-base font-bold text-[#BC000A] whitespace-nowrap">
                        {formatCurrency(moto.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 border-t border-[#E8BCB6] pt-3 text-[10px] text-[#5F5E5E] font-jetBrainsMono uppercase tracking-[0.1em]">
                      <span className="flex items-center gap-1.5">
                        <Zap size={12} className="text-[#BC000A]" />
                        {moto.horsepower ? `${moto.horsepower} HP` : "—"}
                      </span>
                      <span className="h-3 w-px bg-[#E8BCB6]" />
                      <span className="flex items-center gap-1.5">
                        <Award size={12} className="text-[#BC000A]" />
                        {moto.engineCc ? `${moto.engineCc} CC` : "—"}
                      </span>
                    </div>

                    <div className="mt-auto pt-2">
                      <span className="inline-flex items-center gap-2 rounded-[14px] bg-[#1A1B1F] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 group-hover:bg-[#2b2c31]">
                        XEM CHI TIẾT
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us*/}
      <section
        id="about"
        className="py-24 bg-[#F2E3D2] text-[#1A1B1F] overflow-hidden relative"
      >
        <div className="absolute -right-[160px] top-12 h-[420px] w-[420px] rounded-full bg-[#FCD3D8] blur-3xl opacity-70" />
        <div className="absolute left-0 bottom-0 h-[320px] w-[320px] rounded-full bg-[#EEEDF3] blur-3xl opacity-80" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid gap-10 xl:grid-cols-[1fr_1fr] items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-0.5 w-16 rounded bg-[#BC000A]" />
                <p className="bg-[#F3E3D0]/60 text-[#8A5D3F] font-jetBrainsMono text-xs font-semibold uppercase tracking-[0.3em] rounded-full px-3 py-2">
                  Tiêu chuẩn 5 sao
                </p>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-archivoNarrow font-bold tracking-[-0.03em]">
                  Dịch vụ & showroom đẳng cấp
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-[#5F5E5E]">
                  IRON mang đến trải nghiệm mua sắm và dịch vụ xe phân khối lớn
                  hiện đại, chuyên nghiệp và chuẩn quốc tế.
                </p>
              </div>

              <div className="grid gap-5 xl:grid-cols-1">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Bảo hành 5 năm chính hãng",
                    desc: "An tâm tuyệt đối với gói bảo hành mở rộng toàn diện cho mọi dòng xe mới mua tại IRON Showroom.",
                    bg: "bg-[#BC000A]",
                  },
                  {
                    icon: Award,
                    title: "Kỹ thuật chuyên nghiệp",
                    desc: "Kỹ thuật viên được đào tạo định kỳ, sử dụng trang thiết bị chẩn đoán hiện đại nhất hiện nay.",
                    bg: "bg-[#1A1B1F]",
                  },
                  {
                    icon: Users,
                    title: "Showroom trải nghiệm",
                    desc: "Không gian trưng bày chuẩn quốc tế cùng quầy lounge đẳng cấp phục vụ khách tham quan.",
                    bg: "bg-[#E3E2E7]",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="group flex gap-5 rounded-[32px] bg-white p-6 shadow-[0_22px_45px_-28px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_55px_-30px_rgba(0,0,0,0.2)]"
                  >
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-3xl ${item.bg} text-white transition-all duration-300 group-hover:scale-105`}
                    >
                      <item.icon size={22} />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-[#1A1B1F] mb-2">
                        {item.title}
                      </h4>
                      <p className="text-[#5F5E5E] leading-7">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[40px] bg-white shadow-[0_35px_90px_-40px_rgba(0,0,0,0.2)]">
              <div className="absolute -left-[60px] top-12 h-48 w-48 rounded-full bg-[#FCD3D8]/70 blur-3xl" />
              <div className="absolute -right-[80px] bottom-10 h-40 w-40 rounded-full bg-[#EEEDF3]/90 blur-3xl" />
              <img
                src={showImage}
                alt="Showroom"
                className="h-[520px] w-full object-cover"
              />
              <div className="absolute left-6 bottom-6 w-[calc(100%-3rem)] rounded-[32px] bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(0,0,0,0.25)] backdrop-blur-md">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[#BC000A] font-jetBrainsMono text-[10px] uppercase tracking-[0.24em] mb-2">
                      Flagship Store
                    </p>
                    <h3 className="text-2xl font-semibold text-[#1A1B1F]">
                      IRON Showroom
                    </h3>
                    <p className="text-[#5F5E5E] text-sm leading-6 mt-2">
                      Giờ mở cửa: 08:00 - 20:00 (Hàng ngày)
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#BC000A] text-white shadow-lg">
                    <span className="text-xl font-bold">i</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="contact"
        className="relative overflow-hidden bg-[#121212] py-32 text-white"
      >
        <div className="absolute inset-y-0 right-0 hidden w-1/2 overflow-hidden lg:block">
          <p className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[180px] font-heading uppercase tracking-[-0.03em] text-white/10 leading-[0.9] select-none">
            IRON
          </p>
        </div>
        <div className="relative mx-auto max-w-5xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-5xl md:text-[5.5rem] font-semibold tracking-[-0.03em] leading-tight">
              Hành trình bắt đầu tại đây
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base text-white/70 leading-7">
              Đăng ký nhận thông tin về các mẫu xe phiên bản giới hạn và các
              chương trình ưu đãi đặc quyền từ IRON Motor.
            </p>
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="flex w-full max-w-[520px] items-center rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="w-full bg-transparent text-white placeholder:text-white/50 outline-none"
              />
            </div>
            <button className="inline-flex min-w-[220px] items-center justify-center rounded-[24px] bg-[#BC000A] px-8 py-4 text-base font-semibold uppercase tracking-[0.16em] text-white shadow-[0_25px_60px_-30px_rgba(188,0,10,0.65)] transition hover:brightness-110">
              Đăng ký ngay
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
