import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import motorcycleApi from "../../api/motorcycleApi";
import brandApi from "../../api/brandApi";
import { formatCurrency } from "../../utils/formatCurrency";
import HomeHero from "../../components/home/HomeHero";
import {
  ShieldCheck,
  ChevronRight,
  Zap,
  Award,
  Users,
  ArrowRight,
} from "lucide-react";

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
            Dòng xe
          </p>
          <div className="flex flex-wrap justify-center gap-4 xl:gap-6">
            {brands.slice(0, 6).map((brand, index) => (
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
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <p className="text-[#BC000A] font-jetBrainsMono text-xs font-semibold uppercase tracking-[0.3em] mb-4">
              LATEST ARRIVALS
            </p>
            <h2 className="text-4xl md:text-[4.5rem] font-archivoNarrow font-bold tracking-[-0.03em] text-[#1A1B1F] leading-[1.05]">
              MẪU XE MỚI NHẤT
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featured.slice(0, 3).map((moto, index) => (
              <article
                key={moto.id}
                className="group overflow-hidden rounded-[28px] border border-[#E8BCB6] bg-[#FAF9FE] shadow-[0_30px_80px_-55px_rgba(0,0,0,0.25)] transition-all duration-700 ease-out hover:-translate-y-3 hover:shadow-[0_40px_90px_-45px_rgba(188,0,10,0.18)]"
                style={{
                  animation: "fadeInUp 0.8s ease-out both",
                  animationDelay: `${index * 120}ms`,
                }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={moto.thumbnailUrl || "/placeholder-bike.jpg"}
                    alt={moto.name}
                    className="w-full h-[235px] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-[#BC000A] px-3 py-1">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-white font-jetBrainsMono font-semibold">
                      MỚI VỀ
                    </p>
                  </div>
                </div>

                <div className="p-8 flex flex-col gap-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-2xl font-bold text-[#1A1B1F] tracking-[-0.02em]">
                        {moto.name}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#5F5E5E] font-jetBrainsMono">
                        {moto.brandName}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-[#BC000A]">
                      {formatCurrency(moto.price)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-b border-[#E8BCB6] py-6">
                    <div className="flex items-center gap-3">
                      <Zap className="text-[#BC000A]" />
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-[#5F5E5E] font-jetBrainsMono">
                          Mã lực
                        </p>
                        <p className="text-sm font-bold text-[#1A1B1F]">
                          {moto.horsepower ? `${moto.horsepower} HP` : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="text-[#BC000A]" />
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-[#5F5E5E] font-jetBrainsMono">
                          Phân khối
                        </p>
                        <p className="text-sm font-bold text-[#1A1B1F]">
                          {moto.engineCc ? `${moto.engineCc} CC` : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/motorcycles/${moto.slug}`}
                    className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-[#1A1B1F] px-6 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-[#2b2c31]"
                  >
                    XEM CHI TIẾT
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us*/}
      <section
        id="about"
        className="py-24 bg-gray-900 text-white overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-1/3 h-full bg-iron-accent/10 skew-x-12 transform translate-x-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mb-16">
            <h2 className="font-teko text-xl text-iron-yellow uppercase tracking-widest mb-3">
              Tại sao chọn chúng tôi
            </h2>
            <h3 className="font-teko text-5xl md:text-6xl font-semibold mb-6 leading-none">
              Trải Nghiệm Mua Sắm Xe Phân Khối Lớn Chuyên Nghiệp
            </h3>
            <p className="text-gray-400 text-lg">
              Chúng tôi không chỉ bán xe, chúng tôi mang đến một phong cách sống
              và sự an tâm tuyệt đối trên mỗi hành trình.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Bảo Hành Vàng",
                desc: "Chế độ bảo hành chính hãng lên đến 3 năm hoặc 30,000km, hỗ trợ cứu hộ 24/7.",
                color: "bg-blue-500/10 text-blue-400",
              },
              {
                icon: Award,
                title: "Chứng Nhận Quốc Tế",
                desc: "Mọi sản phẩm đều được kiểm định nghiêm ngặt theo tiêu chuẩn Euro 5 và khí thải Việt Nam.",
                color: "bg-iron-accent/20 text-iron-yellow",
              },
              {
                icon: Users,
                title: "Cộng Đồng Rider",
                desc: "Tham gia các tour xuyên Việt và quốc tế dành riêng cho khách hàng của Iron Moto.",
                color: "bg-green-500/10 text-green-400",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-all group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <item.icon size={30} />
                </div>
                <h4 className="font-teko text-3xl mb-3">{item.title}</h4>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-iron-red to-iron-accent rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-2xl shadow-iron-red/25">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="text-center md:text-left text-white max-w-xl">
                <h2 className="font-teko text-5xl md:text-6xl font-semibold mb-4 leading-none">
                  Bạn Đã Sẵn Sàng Chinh Phục?
                </h2>
                <p className="text-white/85 text-lg">
                  Hãy để chúng tôi tư vấn mẫu xe phù hợp nhất với phong cách và
                  cá tính của bạn
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/booking"
                  className="bg-iron-yellow text-black font-teko text-2xl px-10 py-4 rounded-2xl hover:brightness-95 transition-all text-center"
                >
                  Đăng Ký Tư Vấn
                </Link>
                <Link
                  to="/motorcycles"
                  className="bg-black/20 text-white font-teko text-2xl px-10 py-4 rounded-2xl border border-white/20 hover:bg-black/30 transition-all text-center"
                >
                  Xem Bảng Giá
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
