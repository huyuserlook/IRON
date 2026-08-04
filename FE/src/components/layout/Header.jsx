import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User, LogOut, X, Menu, Phone, Info } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import IronLogo from "../common/IronLogo";

const NAV_LINKS = [
  { to: "/", label: "Trang chủ", end: true },
  { to: "/motorcycles", label: "Dòng xe" },
  { to: "/booking", label: "Lái thử" },
  { to: "/about", label: "Giới thiệu" },
  { to: "/contact", label: "Liên hệ" },
];

const PRESS_EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const SCROLL_EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const Header = () => {
  const { user, isAuthenticated, isAdmin, handleLogout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isHome = location.pathname === "/";

  const handleHomeClick = () => {
    setMenuOpen(false);
    if (location.pathname === "/") {
      navigate("/", { state: { reset: Date.now() } });
      return;
    }
    navigate("/");
  };

  const handleAnchorClick = (e, to) => {
    e.preventDefault();
    if (to.startsWith("/#")) {
      const hash = to.replace("/#", "");
      if (location.pathname === "/") {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          setMenuOpen(false);
          return;
        }
      }
      navigate({ pathname: "/", hash: `#${hash}` });
      setMenuOpen(false);
      return;
    }
    setMenuOpen(false);
    navigate(to);
  };

  const navTextColor = isHome && !scrolled ? "text-black" : "text-white";
  const navHoverColor = "hover:text-iron-yellow";
  const buttonBg = "bg-iron-yellow text-black";
  const buttonOutline = "border-transparent";

  const NAV_GAP = scrolled
    ? "gap-3 lg:gap-4 xl:gap-5"
    : "gap-4 lg:gap-5 xl:gap-6";
  const NAV_FONT = scrolled
    ? "text-sm lg:text-sm xl:text-sm"
    : "text-sm lg:text-base xl:text-base";
  const NAV_PY = "py-1";
  const NAV_TRACK = scrolled ? "tracking-[0.04em]" : "tracking-[0.05em]";

  const BTN_SCALE = "scale-[0.96]";
  const ICON_SIZE = 18;
  const AVATAR_SIZE = "h-7 w-7";

  const LOGIN_TEXT = "text-sm lg:text-base";
  const LOGIN_PX = "px-2 sm:px-3 py-1.5";
  const LOGIN_ICON = "mr-0.5";

  const headerPosition = isHome ? "fixed inset-x-0 top-0" : "sticky top-0";
  const headerSurface = scrolled
    ? "bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.75)]"
    : "bg-transparent shadow-none border-b border-transparent";

  return (
    <header
      className={`${headerPosition} z-50 transition-all duration-500 ${SCROLL_EASE} ${headerSurface}`}
    >
      <div
        className={`max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between transition-all duration-500 ${SCROLL_EASE} ${
          scrolled ? "h-10 sm:h-12" : "h-14 sm:h-16 md:h-[68px]"
        }`}
      >
        <div
          className={`select-none cursor-pointer transition-all duration-500 ${SCROLL_EASE} hover:scale-[1.04] active:scale-[0.93] origin-left ${
            scrolled ? "scale-[0.82]" : "scale-[0.94]"
          }`}
        >
          <IronLogo size="sm" onClick={handleHomeClick} />
        </div>
        <nav
          className={`hidden md:flex items-center ${NAV_GAP} font-teko ${NAV_FONT} uppercase ${NAV_TRACK} ${navTextColor} transition-all duration-500 ${SCROLL_EASE}`}
        >
          {NAV_LINKS.map((item) => {
            if (item.isAnchor) {
              const isContact = item.label === "Liên hệ";
              const IconComp = isContact ? Phone : Info;
              return (
                <a
                  key={item.to}
                  href={item.to}
                  onClick={(e) => handleAnchorClick(e, item.to)}
                  className={`group relative ${NAV_PY} select-none cursor-pointer transition-[transform,color,filter] duration-250 ${PRESS_EASE} active:scale-[0.94] ${navTextColor} ${navHoverColor}`}
                >
                  <span className="inline-block transition-transform duration-250 ease-out group-hover:-translate-y-0.5">
                    <IconComp
                      size={14}
                      className="inline -mt-1 mr-1.5 opacity-80"
                      strokeWidth={2}
                    />
                    {item.label}
                  </span>
                  <span className="absolute left-0 -bottom-0.5 h-0.5 bg-iron-yellow rounded-full transition-[width,transform] duration-350 ease-out origin-left w-0 group-hover:w-full" />
                </a>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={(e) => {
                  if (item.to === "/" && location.pathname === "/") {
                    e.preventDefault();
                    handleHomeClick();
                  }
                }}
                className={({ isActive }) =>
                  `group relative ${NAV_PY} select-none cursor-pointer transition-[transform,color,filter] duration-250 ${PRESS_EASE} active:scale-[0.94] ${
                    isActive
                      ? "text-iron-yellow"
                      : `${navTextColor} ${navHoverColor}`
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`inline-block transition-transform duration-250 ease-out ${
                        isActive ? "" : "group-hover:-translate-y-0.5"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`absolute left-0 -bottom-0.5 h-0.5 bg-iron-yellow rounded-full transition-[width,transform] duration-350 ease-out origin-left ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div
          className={`flex items-center gap-2 sm:gap-3 transition-transform duration-500 ${SCROLL_EASE} ${BTN_SCALE} origin-right`}
        >
          <Link
            to="/cart"
            className={`relative group p-2 -m-1.5 select-none cursor-pointer rounded-xl ${buttonBg} transition-[transform,color,background-color] duration-250 ease-out hover:scale-[1.10] active:scale-[0.90] ${buttonOutline}`}
            aria-label="Giỏ hàng"
          >
            <ShoppingCart
              size={ICON_SIZE}
              className="transition-transform duration-300 ease-out group-hover:rotate-[-8deg]"
            />
            {count > 0 && (
              <span
                key={count}
                className={`absolute -top-1 -right-1 bg-iron-yellow text-black text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(255,235,0,0.6)] animate-[cartBounce_0.5s_ease-out] ${
                  scrolled ? "min-w-[18px] h-[18px]" : "min-w-[20px] h-5"
                }`}
              >
                {count}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2 sm:gap-3">
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className={`select-none cursor-pointer text-xs sm:text-sm bg-black/30 hover:bg-black/50 ${LOGIN_PX} rounded-lg transition-[transform,background-color,box-shadow,filter] duration-250 ease-out hover:scale-[1.05] active:scale-[0.93] active:brightness-90 hover:shadow-lg hover:shadow-black/30 font-medium whitespace-nowrap`}
                >
                  Admin
                </Link>
              )}
              <Link
                to="/my-orders"
                className="group text-xs sm:text-sm select-none cursor-pointer hover:text-iron-yellow flex items-center gap-1.5 sm:gap-2 transition-[transform,background-color,color] duration-250 ease-out hover:bg-white/5 px-2 py-1 rounded-lg active:scale-[0.97] active:bg-white/10 whitespace-nowrap"
              >
                <span
                  className={`relative overflow-hidden rounded-full ring-2 ring-transparent group-hover:ring-iron-yellow/60 transition-all duration-300 ease-out group-hover:scale-[1.08] ${AVATAR_SIZE}`}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className={`${AVATAR_SIZE} rounded-full object-cover pointer-events-none select-none`}
                      draggable={false}
                    />
                  ) : (
                    <div
                      className={`${AVATAR_SIZE} rounded-full bg-white/10 flex items-center justify-center`}
                    >
                      <User size={scrolled ? 14 : 16} />
                    </div>
                  )}
                </span>
                <span className="transition-transform duration-300 ease-out group-hover:translate-x-0.5 select-none hidden lg:inline">
                  {user?.fullName?.split(" ").pop()}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className={`group select-none cursor-pointer hover:text-red-200 transition-[transform,color,background-color] duration-250 ease-out p-2 rounded-lg hover:bg-white/10 hover:scale-[1.10] active:scale-[0.88] active:bg-white/15`}
                aria-label="Đăng xuất"
              >
                <LogOut
                  size={ICON_SIZE}
                  className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                state={{ from: location }}
                className={`select-none cursor-pointer bg-iron-yellow text-black ${LOGIN_PX} rounded-lg transition-[transform,box-shadow,filter] duration-250 ease-out font-teko ${LOGIN_TEXT} hover:brightness-110 hover:scale-[1.05] active:scale-[0.93] active:brightness-95 hover:shadow-[0_6px_20px_-4px_rgba(255,235,0,0.6)] whitespace-nowrap ${LOGIN_ICON}`}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className={`select-none cursor-pointer bg-orange-500 hover:bg-orange-400 ${LOGIN_PX} rounded-lg transition-[transform,background-color,box-shadow,filter] duration-250 ease-out hover:scale-[1.05] active:scale-[0.93] active:brightness-95 hover:shadow-[0_6px_20px_-4px_rgba(249,115,22,0.6)] text-sm whitespace-nowrap`}
              >
                Đăng ký
              </Link>
            </div>
          )}

          <button
            type="button"
            className={`md:hidden p-2 -m-2 select-none cursor-pointer rounded-xl hover:bg-white/10 active:bg-white/20 transition-[transform,background-color] duration-200 ease-out active:scale-[0.90]`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            <div className="relative w-6 h-5">
              <Menu
                size={22}
                strokeWidth={2.2}
                className={`absolute inset-0 transition-all duration-300 ${PRESS_EASE} ${
                  menuOpen
                    ? "opacity-0 rotate-90 scale-50"
                    : "opacity-100 rotate-0 scale-100"
                }`}
              />
              <X
                size={22}
                strokeWidth={2.2}
                className={`absolute inset-0 transition-all duration-300 ${PRESS_EASE} ${
                  menuOpen
                    ? "opacity-100 rotate-0 scale-100"
                    : "opacity-0 -rotate-90 scale-50"
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          menuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className={`px-4 pb-5 pt-2 flex flex-col gap-2 font-teko text-lg uppercase bg-iron-accent/95 backdrop-blur-xl border-t border-white/10 transition-all duration-500 ${
            menuOpen ? "translate-y-0" : "-translate-y-4"
          }`}
        >
          {NAV_LINKS.map((item, i) => {
            const isContact = item.label === "Liên hệ";
            const IconComp = isContact ? Phone : Info;
            const content = (
              <>
                {item.label}
                {item.isAnchor && (
                  <IconComp
                    size={14}
                    className="inline -mt-1 ml-2 opacity-80"
                    strokeWidth={2}
                  />
                )}
              </>
            );
            const style = {
              transitionDelay: menuOpen ? `${80 + i * 60}ms` : "0ms",
              transform: menuOpen
                ? "translateX(0) translateY(0)"
                : "translateX(-12px) translateY(-4px)",
              opacity: menuOpen ? 1 : 0,
            };
            if (item.isAnchor) {
              return (
                <a
                  key={item.to}
                  href={item.to}
                  onClick={(e) => handleAnchorClick(e, item.to)}
                  className={`relative select-none cursor-pointer px-4 py-3 rounded-xl transition-[transform,background-color,color,padding] duration-250 ease-out active:scale-[0.98] active:translate-y-px text-white hover:bg-white/5 hover:text-iron-yellow hover:pl-6 active:bg-white/10`}
                  style={style}
                >
                  {content}
                </a>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `relative select-none cursor-pointer px-4 py-3 rounded-xl transition-[transform,background-color,color,padding] duration-250 ease-out active:scale-[0.98] active:translate-y-px ${
                    isActive
                      ? "bg-white/10 text-iron-yellow pl-6 shadow-inner"
                      : "text-white hover:bg-white/5 hover:text-iron-yellow hover:pl-6 active:bg-white/10"
                  }`
                }
                style={style}
              >
                {content}
              </NavLink>
            );
          })}

          <div className="h-px bg-white/10 my-2" />

          {isAuthenticated ? (
            <div
              className="flex flex-col gap-1"
              style={{
                transitionDelay: menuOpen ? "260ms" : "0ms",
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateY(0)" : "translateY(-4px)",
                transition: "all 300ms ease-out",
              }}
            >
              <Link
                to="/my-orders"
                onClick={() => setMenuOpen(false)}
                className="select-none cursor-pointer px-4 py-3 rounded-xl hover:bg-white/5 transition-[transform,background-color] duration-250 ease-out flex items-center gap-3 active:scale-[0.98] active:bg-white/10 active:translate-y-px"
              >
                <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="h-full w-full rounded-full object-cover pointer-events-none select-none"
                      draggable={false}
                    />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <span className="select-none">{user?.fullName}</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="select-none cursor-pointer px-4 py-3 rounded-xl bg-black/20 hover:bg-black/40 transition-[transform,background-color,filter] duration-250 ease-out active:scale-[0.98] active:translate-y-px active:brightness-90"
                >
                  Bảng điều khiển Admin
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="select-none cursor-pointer text-left px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-[transform,background-color,color] duration-250 ease-out flex items-center gap-3 active:scale-[0.98] active:translate-y-px active:bg-red-500/15"
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </div>
          ) : (
            <div
              className="flex flex-col gap-2 pt-1"
              style={{
                transitionDelay: menuOpen ? "260ms" : "0ms",
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateY(0)" : "translateY(-4px)",
                transition: "all 300ms ease-out",
              }}
            >
              <Link
                to="/login"
                state={{ from: location }}
                onClick={() => setMenuOpen(false)}
                className="w-full text-center select-none cursor-pointer bg-iron-yellow text-black px-5 py-3 rounded-xl font-teko text-2xl transition-[transform,filter,box-shadow] duration-250 ease-out hover:brightness-110 active:scale-[0.97] active:brightness-95 active:translate-y-px hover:shadow-[0_6px_24px_-4px_rgba(255,235,0,0.55)]"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center select-none cursor-pointer bg-orange-500 hover:bg-orange-400 px-5 py-3 rounded-xl transition-[transform,background-color,filter] duration-250 ease-out active:scale-[0.97] active:brightness-95 active:translate-y-px"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>

      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 top-[48px] sm:top-[56px] bg-black/40 backdrop-blur-sm z-[-1] animate-[fadeIn_0.3s_ease-out] cursor-pointer"
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      )}

      <style>{`
      * { -webkit-tap-highlight-color: transparent; }
      .select-none, .select-none * { -webkit-user-select: none; user-select: none; }

      @keyframes cartBounce {
        0%   { transform: scale(1); }
        22%  { transform: scale(1.42) rotate(-8deg); }
        42%  { transform: scale(0.88) rotate(5deg); }
        65%  { transform: scale(1.16) rotate(-2deg); }
        85%  { transform: scale(0.97) rotate(1deg); }
        100% { transform: scale(1); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      html { scroll-behavior: smooth; }
    `}</style>
    </header>
  );
};

export default Header;
