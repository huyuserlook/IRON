import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";

const LoginPage = () => {
  const { handleLogin, handleSocialLogin, loading, error } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin(form);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const socialData = {
        email: decoded.email,
        fullName: decoded.name,
        avatarUrl: decoded.picture,
        providerId: decoded.sub,
        provider: "GOOGLE",
      };
      await handleSocialLogin(socialData);
      toast.success("Đăng nhập bằng Google thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi đăng nhập bằng Google");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
          <p className="text-gray-500">Chào mừng bạn trở lại Iron Moto</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">
              Hoặc tiếp tục với
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Đăng nhập Google thất bại")}
            useOneTap
            shape="circle"
            width="100%"
          />
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-orange-500 hover:text-orange-600 font-bold ml-1 transition-colors"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
