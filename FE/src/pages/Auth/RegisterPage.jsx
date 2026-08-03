import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useSocialAuth } from "../../hooks/useSocialAuth";
import AuthShell from "../../components/auth/AuthShell";
import SocialAuthButtons from "../../components/auth/SocialAuthButtons";
import Input from "../../components/common/Input";

const RegisterPage = () => {
  const location = useLocation();
  const { handleRegister, loading, error } = useAuth();
  const redirectTo = location.state?.from?.pathname || "/";
  const { handleGoogleLogin, handleFacebookLogin, loadingProvider } =
    useSocialAuth(redirectTo);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleRegister(form);
  };

  return (
    <AuthShell
      mode="register"
      title="Đăng ký"
      subtitle="Tạo tài khoản mới để bắt đầu."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Input
          label="Họ và tên"
          type="text"
          required
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          placeholder="Nguyễn Văn A"
          labelClassName="text-[11px] text-[#6f6251]"
          radiusClassName="rounded-[28px]"
          inputClassName="border-white/20 bg-white/40 text-[#1b1a17] placeholder:text-[#8D8578] focus:border-[#7a6e5d] focus:ring-[#7a6e5d]/15"
        />

        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="email@example.com"
          labelClassName="text-[11px] text-[#6f6251]"
          radiusClassName="rounded-[28px]"
          inputClassName="border-white/20 bg-white/40 text-[#1b1a17] placeholder:text-[#8D8578] focus:border-[#7a6e5d] focus:ring-[#7a6e5d]/15"
        />

        <Input
          label="Số điện thoại"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="0905xxxxxx"
          labelClassName="text-[11px] text-[#6f6251]"
          radiusClassName="rounded-[28px]"
          inputClassName="border-white/20 bg-white/40 text-[#1b1a17] placeholder:text-[#8D8578] focus:border-[#7a6e5d] focus:ring-[#7a6e5d]/15"
        />

        <Input
          label="Mật khẩu"
          type={showPassword ? "text" : "password"}
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••"
          labelClassName="text-[11px] text-[#6f6251]"
          radiusClassName="rounded-[28px]"
          inputClassName="border-white/20 bg-white/40 text-[#1b1a17] placeholder:text-[#8D8578] focus:border-[#7a6e5d] focus:ring-[#7a6e5d]/15"
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B6257] transition-colors hover:bg-black/5 hover:text-[#1b1a17]"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="group inline-flex h-11 w-full items-center justify-center rounded-full bg-[#F3E6BF] text-sm font-semibold text-[#1b1a17] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f6ebca] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>

        <div className="relative py-1">
          <div className="absolute inset-x-0 top-1/2 h-px bg-black/10" />
          <div className="relative flex justify-center">
            <span className="bg-[rgba(236,226,209,0.72)] px-4 text-[11px] text-[#7A7164]">
              Đăng ký nhanh
            </span>
          </div>
        </div>

        <SocialAuthButtons
          onGoogle={handleGoogleLogin}
          onFacebook={handleFacebookLogin}
          loadingProvider={loadingProvider}
        />

        <p className="pt-2 text-center text-sm text-[#5D544A]">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            state={{ from: location.state?.from ?? location }}
            className="font-semibold text-[#BC000A] transition-colors hover:text-[#8E0008]"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default RegisterPage;
