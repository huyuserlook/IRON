import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { Mail, ArrowLeft } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { handleForgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  const location = useLocation();

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-sm border">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Kiểm tra email của bạn
          </h2>
          <p className="text-gray-600">
            Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến{" "}
            <strong>{email}</strong>.
          </p>
          <Link
            to="/login"
            state={{ from: location.state?.from ?? location }}
            className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Quên mật khẩu?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nhập email của bạn và chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail className="text-gray-400" size={18} />}
          />
          <div>
            <Button
              type="submit"
              className="w-full"
              isLoading={loading}
              disabled={!email}
            >
              Gửi yêu cầu
            </Button>
          </div>
          <div className="text-center">
            <Link
              to="/login"
              state={{ from: location.state?.from ?? location }}
              className="inline-flex items-center text-sm text-gray-500 hover:text-orange-500 transition-colors"
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
