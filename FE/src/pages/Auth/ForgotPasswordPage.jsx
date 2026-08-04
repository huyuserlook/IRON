import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { Mail, ArrowLeft } from "lucide-react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { handleForgotPassword } = useAuth();
  const location = useLocation();

  const valid = emailRegex.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) {
      toast.error("Vui lòng nhập email hợp lệ");
      return;
    }
    setLoading(true);
    const result = await handleForgotPassword(email);
    setLoading(false);
    if (result.success) {
      setSubmitted(true);
      toast.success("Đã gửi yêu cầu khôi phục mật khẩu!");
    } else {
      toast.error(result.message);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#fbfaf9,#f3efe8)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full text-center space-y-6 bg-white p-10 rounded-3xl shadow-lg border">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-50">
            <Mail className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Kiểm tra email của bạn
          </h2>
          <p className="text-gray-600">
            Hướng dẫn khôi phục mật khẩu đã được gửi tới{" "}
            <strong>{email}</strong>.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/login"
              state={{ from: location.state?.from ?? { pathname: "/" } }}
              className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold text-[#1b1a17] bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#fbfaf9,#f3efe8)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl shadow-lg border">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-50">
            <Mail className="h-6 w-6 text-yellow-600" />
          </div>
          <h2 className="mt-4 text-center text-2xl font-extrabold text-gray-900">
            Quên mật khẩu?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <Input
            label="Email"
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail className="text-gray-400" size={18} />}
            helperText={!email ? "" : valid ? "" : "Email không hợp lệ"}
          />

          <div>
            <Button
              type="submit"
              className="w-full rounded-full bg-iron-yellow text-black font-semibold py-3 hover:brightness-95"
              isLoading={loading}
              disabled={!valid || loading}
            >
              Gửi liên kết khôi phục
            </Button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              state={{ from: location.state?.from ?? { pathname: "/" } }}
              className="inline-flex items-center text-sm text-gray-600 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
