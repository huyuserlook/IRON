import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { House } from "lucide-react";
import backgroundLoginImage from "../../assets/img/backroud-login.jpg";
import loginCardImage from "../../assets/img/login1.jpg";

const AuthShell = ({ mode = "login", title, subtitle, children }) => {
  const [mounted, setMounted] = useState(false);
  const isRegister = mode === "register";

  useEffect(() => {
    setMounted(false);
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, [mode]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [mode]);

  const imagePosition = isRegister
    ? "lg:order-2 lg:-ml-4"
    : "lg:order-1 lg:-mr-4";
  const formPosition = isRegister
    ? "lg:order-1 lg:-mr-8"
    : "lg:order-2 lg:-ml-8";

  const imageMotion = mounted
    ? "opacity-100 translate-x-0 scale-100"
    : isRegister
      ? "opacity-0 translate-x-16 scale-[0.94]"
      : "opacity-0 -translate-x-16 scale-[0.94]";

  const formMotion = mounted
    ? "opacity-100 translate-x-0 scale-100"
    : isRegister
      ? "opacity-0 -translate-x-16 scale-[0.94]"
      : "opacity-0 translate-x-16 scale-[0.94]";

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#070707]">
      <Link
        to="/"
        className="absolute left-4 top-4 z-30 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#F1E6C8] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/50 hover:text-white sm:left-6 sm:top-6"
      >
        <House size={14} />
        Về trang chủ
      </Link>

      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundLoginImage})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.56)_0%,rgba(11,11,11,0.35)_38%,rgba(11,11,11,0.68)_100%)]" />
      <div className="absolute inset-0 bg-black/12" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1240px] items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col items-center justify-center gap-6 lg:flex-row lg:gap-0">
          <div
            className={`${imagePosition} relative z-20 w-full max-w-[350px] transform-gpu transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${imageMotion}`}
          >
            <div className="relative overflow-hidden rounded-[72px] bg-[#060606] shadow-[0_40px_120px_-60px_rgba(0,0,0,0.95)] ring-1 ring-white/10">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.01)_55%,rgba(255,255,255,0.05)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.14),transparent_36%)]" />
              <div className="relative aspect-[0.68/1] min-h-[520px] w-full">
                <img
                  src={loginCardImage}
                  alt="Motorcycle"
                  className="absolute inset-0 h-full w-full object-cover object-center drop-shadow-[0_28px_48px_rgba(0,0,0,0.75)]"
                />
              </div>
            </div>
          </div>

          <div
            className={`${formPosition} relative z-10 w-full max-w-[620px] transform-gpu transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${formMotion}`}
          >
            <div className="relative min-h-[360px] rounded-[60px] bg-[rgba(236,226,209,0.56)] p-6 shadow-[0_36px_100px_-60px_rgba(0,0,0,0.9)] ring-1 ring-white/20 backdrop-blur-[20px] sm:p-8 lg:p-10">
              <div className="mx-auto w-full max-w-[420px]">
                <div className="mb-7 text-center sm:mb-8">
                  <h1 className="text-3xl font-semibold tracking-tight text-[#F1E6C8] drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)] sm:text-4xl">
                    {title}
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-[#3b342b]/80 sm:text-[15px]">
                    {subtitle}
                  </p>
                </div>

                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthShell;
