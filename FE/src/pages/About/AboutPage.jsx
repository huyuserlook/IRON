import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Gauge, HeartHandshake, Ruler } from "lucide-react";
import aboutHero from "../../assets/img/about-hero.jpg";

const CORE_VALUES = [
  {
    icon: Ruler,
    title: "Kỹ thuật Chính xác",
    description:
      "Mỗi chi tiết trên xe IRON đều được chế tác với độ chính xác đến từng milimet, đảm bảo hiệu suất tối ưu và độ bền vượt trội.",
  },
  {
    icon: Gauge,
    title: "Hiệu suất Cao",
    description:
      "Chúng tôi không ngừng đổi mới công nghệ động cơ và khung xe để mang lại trải nghiệm tăng tốc mạnh mẽ và cảm giác lái đỉnh cao.",
  },
  {
    icon: HeartHandshake,
    title: "Trải nghiệm Khách hàng",
    description:
      "Từ showroom đến dịch vụ hậu mãi, IRON cam kết mang đến hành trình sở hữu xe đẳng cấp, chu đáo và đáng tin cậy.",
  },
];

const useReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
};

const Reveal = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  as: Tag = "div",
}) => {
  const { ref, visible } = useReveal();

  const transforms = {
    up: visible ? "translateY(0)" : "translateY(32px)",
    left: visible ? "translateX(0)" : "translateX(-40px)",
    right: visible ? "translateX(0)" : "translateX(40px)",
    scale: visible ? "scale(1)" : "scale(0.96)",
  };

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: transforms[direction],
        transition: `opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.85s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
};

const AboutPage = () => {
  const heroRef = useRef(null);
  const [heroOffset, setHeroOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      if (rect.bottom > 0) {
        setHeroOffset(window.scrollY * 0.28);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#1A1B1F]">
      <style>{`
        @keyframes aboutHeroZoom {
          0% { opacity: 0; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes aboutLineGrow {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }
        @keyframes aboutTitleIn {
          0% { opacity: 0; transform: translateY(28px); letter-spacing: 0.12em; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: -0.02em; }
        }
        @keyframes aboutCardGlow {
          0%, 100% { box-shadow: 0 24px 60px -34px rgba(0,0,0,0.12); }
          50% { box-shadow: 0 28px 70px -30px rgba(188,0,10,0.14); }
        }
        .about-hero-image {
          animation: aboutHeroZoom 1.2s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .about-hero-title {
          animation: aboutTitleIn 1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
        }
        .about-hero-line {
          animation: aboutLineGrow 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.55s both;
        }
        .about-value-card:hover .about-value-icon {
          background: linear-gradient(135deg, #BC000A 0%, #E31B23 100%);
          color: white;
          transform: scale(1.08) rotate(-4deg);
        }
        .about-value-card:hover {
          border-color: rgba(188, 0, 10, 0.18);
          transform: translateY(-6px);
        }
        @media (prefers-reduced-motion: reduce) {
          .about-hero-image,
          .about-hero-title,
          .about-hero-line {
            animation: none !important;
          }
        }
      `}</style>

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative isolate -mt-14 overflow-hidden sm:-mt-16 md:-mt-[68px]"
      >
        <div className="relative h-[420px] sm:h-[480px] lg:h-[520px]">
          <img
            src={aboutHero}
            alt="Nhà máy IRON Motor"
            className="about-hero-image absolute inset-0 h-[115%] w-full object-cover will-change-transform"
            style={{ transform: `translateY(${heroOffset}px)` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.72)_78%,#FFFFFF_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0.45)_100%)]" />

          <div className="relative mx-auto flex h-full max-w-[1280px] items-end justify-center px-4 pb-16 sm:px-6 lg:px-12 lg:pb-20">
            <div className="text-center">
              <nav
                aria-label="Breadcrumb"
                className="mb-5 flex flex-wrap items-center justify-center gap-2 text-sm text-[#5E3F3B]/80"
              >
                <Link
                  to="/"
                  className="transition-colors hover:text-[#BC000A]"
                >
                  Trang chủ
                </Link>
                <span>/</span>
                <span className="font-semibold text-[#1A1B1F]">
                  Giới thiệu
                </span>
              </nav>

              <h1 className="about-hero-title font-heading text-[clamp(2.4rem,6.5vw,4.8rem)] font-bold uppercase leading-[0.95] text-[#1A1B1F]">
                Về Chúng Tôi - IRON Motor
              </h1>
              <span className="about-hero-line mx-auto mt-5 block h-1 w-16 origin-center rounded-full bg-[#BC000A]" />
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="relative py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16 xl:gap-24">
            <Reveal direction="left">
              <h2 className="font-heading text-[clamp(2rem,4.5vw,3.4rem)] font-bold uppercase leading-[1.05] tracking-[-0.02em] text-[#1A1B1F]">
                Hành trình của
                <br />
                <span className="text-[#BC000A]">độ chính xác</span>
                <br />
                và tốc độ.
              </h2>
            </Reveal>

            <Reveal direction="right" delay={120}>
              <div className="space-y-5 text-base leading-8 text-[#5E3F3B] sm:text-[17px]">
                <p>
                  Tại IRON Motor, chúng tôi không chỉ sản xuất xe mà còn kiến
                  tạo những biểu tượng của sự tự do và đam mê tốc độ. Mỗi chiếc
                  xe ra đời từ sự kết hợp giữa kỹ thuật chế tác tinh xảo và công
                  nghệ hiện đại.
                </p>
                <p>
                  Với hơn một thập kỷ phát triển, IRON đã trở thành thương hiệu
                  mô tô phân khối lớn được tin tưởng bởi hàng nghìn rider trên
                  khắp Việt Nam — nơi mỗi chi tiết đều được chế tác để mang lại
                  trải nghiệm lái đỉnh cao.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="relative overflow-hidden bg-[#F8F6F7] py-20 sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#FCD3D8]/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-8 h-64 w-64 rounded-full bg-[#EEEDF3]/80 blur-3xl" />

        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-12">
          <Reveal className="text-center">
            <h2 className="font-heading text-[clamp(2.2rem,5vw,3.6rem)] font-bold uppercase tracking-[-0.02em] text-[#1A1B1F]">
              Giá trị cốt lõi
            </h2>
            <span className="mx-auto mt-4 block h-1 w-14 rounded-full bg-[#BC000A]" />
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-8">
            {CORE_VALUES.map((item, index) => (
              <Reveal key={item.title} delay={index * 120}>
                <article className="about-value-card group h-full rounded-[24px] border border-transparent bg-white p-8 shadow-[0_24px_60px_-34px_rgba(0,0,0,0.12)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
                  <div className="about-value-icon mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#EAE5E8] text-[#1A1B1F] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
                    <item.icon size={24} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1B1F]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[#5E3F3B]">
                    {item.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="relative overflow-hidden bg-[#1A1B1F] py-20 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(188,0,10,0.35),transparent_55%)]" />
        <Reveal className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#FFEB00]">
            Sẵn sàng trải nghiệm
          </p>
          <h2 className="mt-4 font-heading text-[clamp(2.2rem,5vw,3.8rem)] font-semibold uppercase leading-tight tracking-[-0.03em]">
            Khám phá dòng xe IRON
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/70">
            Ghé thăm showroom hoặc đặt lịch lái thử để cảm nhận sức mạnh và độ
            chính xác trong từng chi tiết.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/motorcycles"
              className="inline-flex min-w-[200px] items-center justify-center rounded-[14px] bg-[#BC000A] px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[0_20px_50px_-28px_rgba(188,0,10,0.8)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
            >
              Xem dòng xe
            </Link>
            <Link
              to="/booking"
              className="inline-flex min-w-[200px] items-center justify-center rounded-[14px] border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
            >
              Đặt lịch lái thử
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default AboutPage;
