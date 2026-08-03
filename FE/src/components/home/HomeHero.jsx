import { useCallback, useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Facebook,
  Instagram,
  ShoppingCart,
  User,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import IronLogo from "../common/IronLogo";
import ducatiImg from "../../assets/img/ducati.png";
import z1000Img from "../../assets/img/z1000.png";
import bmwImg from "../../assets/img/BMW.png";
import cbrImg from "../../assets/img/cbr.png";
import harleyImg from "../../assets/img/harley-davidson.png";

const SLIDES = [
  {
    brand: "Ducati",
    image: ducatiImg,
    bg: "#94000D",
    panel: "#C91B1B",
    dot: "#C91B1B",
    light: false,
  },
  {
    brand: "KAWASAKI",
    image: z1000Img,
    bg: "#1B5E20",
    panel: "#43A047",
    dot: "#15A241",
    light: false,
  },
  {
    brand: "BMW",
    image: bmwImg,
    bg: "#1A1C1E",
    panel: "#3A3F44",
    dot: "#0A0B0D",
    light: false,
  },
  {
    brand: "HONDA",
    image: cbrImg,
    bg: "#7A8B9A",
    panel: "#A8B6C4",
    dot: "#B9BFC9",
    light: true,
  },
  {
    brand: "HARLEY",
    image: harleyImg,
    bg: "#6B4F2A",
    panel: "#A67C52",
    dot: "#BFA27A",
    light: false,
  },
];

const NAV_ITEMS = [
  { label: "Trang chủ", to: "/", end: true },
  { label: "Dòng xe", to: "/motorcycles" },
  { label: "Lái thử", to: "/booking" },
];

const HomeHero = () => {
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const slide = SLIDES[index];
  const total = SLIDES.length;

  const { user, isAuthenticated, isAdmin, handleLogout } = useAuth();
  const { count } = useCart();

  const navInk = slide.light ? "text-gray-900" : "text-white";
  const ink = slide.light ? "text-gray-900" : "text-white";
  const inkMuted = slide.light ? "text-gray-600" : "text-white/70";

  const goTo = useCallback(
    (next) => {
      setIndex(((next % total) + total) % total);
      setAnimKey((k) => k + 1);
    },
    [total],
  );

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => goTo(index + 1), 5000);
    return () => clearInterval(timer);
  }, [paused, goTo, index]);

  return (
    <section
      className="relative min-h-screen overflow-hidden transition-[background-color] duration-700 ease-out"
      style={{ backgroundColor: slide.bg }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[55%] bg-iron-accent origin-top-right animate-fade-in"
        style={{
          backgroundColor: slide.panel,
          clipPath: "polygon(16% 0, 100% 0, 100% 100%, 0% 100%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent 0,
            transparent 118px,
            rgba(0,0,0,0.35) 118px,
            rgba(0,0,0,0.35) 119px
          )`,
        }}
      />

      <header className="relative z-30 px-4 sm:px-8 lg:px-14 pt-6 sm:pt-8">
        <div className="flex items-center justify-between gap-4">
          <IronLogo size="lg" className="shrink-0" />

          <nav
            className="hidden lg:flex items-end gap-8 xl:gap-12 animate-fade-up"
            style={{ animationDelay: "160ms" }}
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `font-teko text-3xl xl:text-[48px] uppercase leading-none tracking-wide transition-all duration-300 ${navInk} ${
                    isActive
                      ? "opacity-100"
                      : "opacity-80 hover:opacity-100 hover:-translate-y-0.5"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/cart"
              className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                slide.light
                  ? "bg-black/10 hover:bg-black/20"
                  : "bg-black/20 hover:bg-black/35"
              } ${ink}`}
              aria-label="Giỏ hàng"
            >
              <ShoppingCart size={18} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-iron-yellow px-1 text-[10px] font-bold text-black">
                  {count}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div
                className={`hidden sm:flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 border ${
                  slide.light
                    ? "bg-black/10 border-black/10"
                    : "bg-black/25 border-white/10"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-iron-yellow text-black">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <div className={`leading-tight max-w-[110px] ${ink}`}>
                  <p className="font-teko text-lg leading-none truncate">
                    {user?.fullName?.split(" ").slice(-1)[0]}
                  </p>
                  <div
                    className={`flex gap-2 text-[10px] uppercase tracking-wider ${inkMuted}`}
                  >
                    <Link to="/my-orders" className="hover:opacity-100 opacity-80">
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="hover:opacity-100 opacity-80"
                      >
                        Admin
                      </Link>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`rounded-full p-1.5 transition-colors ${inkMuted} hover:opacity-100`}
                  aria-label="Đăng xuất"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`font-teko text-3xl xl:text-5xl uppercase leading-none tracking-wide transition-all duration-300 hover:-translate-y-0.5 ${ink}`}
              >
                Đăng nhập
              </Link>
            )}

            <button
              type="button"
              className={`lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full ${
                slide.light ? "bg-black/10" : "bg-black/25"
              } ${ink}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            className={`lg:hidden mt-4 rounded-2xl backdrop-blur-md border p-4 flex flex-col gap-3 ${
              slide.light
                ? "bg-white/80 border-black/10 text-iron-dark"
                : "bg-black/40 border-white/10 text-white"
            }`}
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="font-teko text-3xl uppercase tracking-wide"
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/my-orders" onClick={() => setMenuOpen(false)}>
                  Profile — {user?.fullName}
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="text-left text-red-400"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="font-teko text-2xl text-iron-yellow"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        )}
      </header>

      <div className="relative z-10 flex min-h-[calc(100vh-130px)] flex-col items-center justify-center px-4 pb-28 pt-4">
        <div
          key={`brand-${animKey}`}
          className="pointer-events-none absolute inset-x-0 top-[12%] sm:top-[10%] flex justify-center overflow-hidden select-none animate-brand-in"
        >
          <p
            className="font-teko font-bold uppercase leading-none tracking-tight text-[clamp(5rem,22vw,28rem)] text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.02) 100%)",
            }}
          >
            {slide.brand}
          </p>
        </div>

        <div className="relative z-20 flex w-full max-w-5xl flex-1 items-center justify-center">
          <div key={`bike-${animKey}`} className="animate-slide-bike">
            <img
              src={slide.image}
              alt={slide.brand}
              className="mx-auto w-[min(92vw,860px)] max-h-[48vh] sm:max-h-[56vh] object-contain drop-shadow-[0_28px_50px_rgba(0,0,0,0.4)] animate-float"
            />
          </div>
        </div>

        <div className="relative z-20 mt-2 flex flex-col items-center gap-5 sm:gap-6">
          <Link
            to="/motorcycles"
            className="group inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 sm:px-10 sm:py-4 font-teko text-2xl sm:text-[36px] font-medium leading-none tracking-wide text-iron-dark shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            XEM CHI TIẾT
          </Link>

          <div className="inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-2.5 shadow-md">
            {SLIDES.map((s, i) => (
              <button
                key={s.brand}
                type="button"
                onClick={() => goTo(i)}
                className={`relative h-[28px] w-[28px] rounded-full border border-[#24282B] transition-transform duration-200 ${
                  i === index
                    ? "scale-110 ring-2 ring-offset-1 ring-black/30"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: s.dot }}
                aria-label={s.brand}
              >
                {i === index && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg width="12" height="9" viewBox="0 0 14 10" fill="none">
                      <path
                        d="M13.76 1.35L5.15 9.77a.77.77 0 01-1.14 0L.24 6.08a.77.77 0 011.14-1.03l3.2 3.13L12.62.23a.77.77 0 011.14 1.12z"
                        fill="white"
                      />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between px-5 sm:px-10 lg:px-14 pb-6 sm:pb-8">
        <div className={`flex items-center gap-5 ${ink}`}>
          <a
            href="#"
            className="opacity-90 hover:opacity-100 hover:scale-110 transition-all"
            aria-label="Facebook"
          >
            <Facebook size={26} strokeWidth={1.5} />
          </a>
          <a
            href="#"
            className="opacity-90 hover:opacity-100 hover:scale-110 transition-all"
            aria-label="X"
          >
            <svg width="22" height="22" viewBox="0 0 24 26" fill="currentColor">
              <path d="M23.83 24.32L15.3 11.01l8.42-9.2a1.04 1.04 0 00-.11-1.47 1.05 1.05 0 00-1.47.06L14.08 9.11 8.56.5A1.05 1.05 0 007.64 0H1.1A1.08 1.08 0 00.01 1.66l8.53 13.31L.29 24.18a1.08 1.08 0 00.98 1.8h6.46l5.52-8.61 5.52 8.61h6.46a1.08 1.08 0 00.98-1.66zM16.97 23.82L3.09 2.17h3.95l13.88 21.65h-3.95z" />
            </svg>
          </a>
          <a
            href="#"
            className="opacity-90 hover:opacity-100 hover:scale-110 transition-all"
            aria-label="Instagram"
          >
            <Instagram size={26} strokeWidth={1.5} />
          </a>
        </div>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          className="font-teko group text-right"
          aria-label="Slide tiếp"
        >
          <span className="inline-flex items-baseline">
            <span
              className={`text-5xl sm:text-[88px] leading-none transition-transform group-hover:scale-105 ${ink}`}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className={`text-2xl sm:text-[44px] leading-none ${inkMuted}`}>
              /{String(total).padStart(2, "0")}
            </span>
          </span>
        </button>
      </div>
    </section>
  );
};

export default HomeHero;
