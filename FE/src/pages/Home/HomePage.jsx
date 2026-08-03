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
    motorcycleApi.getFeatured().then((res) => {
      const items = Array.isArray(res) ? res : res || [];
      setFeatured(items);
    });

    brandApi.getAll().then((res) => {
      const items = Array.isArray(res) ? res : res || [];
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
      {/* Brands */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-400 text-sm font-bold uppercase tracking-[0.2em] mb-10">
            Đối tác chiến lược
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all">
            {brands.slice(0, 6).map((brand) => (
              <Link key={brand.id} to={`/motorcycles?brandId=${brand.id}`}>
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="h-8 md:h-12 object-contain"
                  />
                ) : (
                  <span className="font-bold text-2xl text-gray-400">
                    {brand.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="font-teko text-xl text-iron-accent uppercase tracking-widest mb-2">
                Sản phẩm nổi bật
              </h2>
              <h3 className="font-teko text-5xl md:text-6xl font-semibold text-gray-900 leading-none">
                Siêu Phẩm Đang Chờ Bạn
              </h3>
            </div>
            <Link
              to="/motorcycles"
              className="inline-flex items-center gap-2 font-teko text-2xl text-gray-900 hover:text-iron-accent transition-colors group"
            >
              Xem tất cả bộ sưu tập
              <ChevronRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.slice(0, 8).map((moto) => (
              <div
                key={moto.id}
                className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-iron-accent/30 hover:shadow-2xl hover:shadow-iron-accent/10 transition-all duration-500"
              >
                <Link
                  to={`/motorcycles/${moto.slug}`}
                  className="block overflow-hidden h-64"
                >
                  {moto.thumbnailUrl ? (
                    <img
                      src={moto.thumbnailUrl}
                      alt={moto.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                    {moto.categoryName || "Mới về"}
                  </div>
                </Link>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-iron-accent uppercase tracking-wider">
                      {moto.brandName}
                    </p>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Zap size={12} className="text-yellow-500" />
                      {moto.engineCc}cc
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-4 line-clamp-1 group-hover:text-iron-accent transition-colors">
                    {moto.name}
                  </h4>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-xl font-black text-gray-900">
                      {formatCurrency(moto.price)}
                    </span>
                    <Link
                      to={`/motorcycles/${moto.slug}`}
                      className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 group-hover:bg-iron-accent group-hover:text-white transition-all"
                    >
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
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
