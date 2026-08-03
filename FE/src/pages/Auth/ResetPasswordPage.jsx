import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { Lock, CheckCircle2 } from "lucide-react";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { handleResetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp");
    }

    setLoading(true);
    const result = await handleResetPassword({ token, newPassword: password });
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      toast.success("Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate("/login"), 3000);
    } else {
      toast.error(result.message);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold text-red-600">Lỗi: Thiếu mã xác thực</h2>
          <p className="mt-2 text-gray-600">Vui lòng kiểm tra lại liên kết trong email của bạn.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-sm border">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Thành công!</h2>
          <p className="text-gray-600">
            Mật khẩu của bạn đã được cập nhật. Bạn sẽ được chuyển hướng đến trang đăng nhập trong giây lát.
          </p>
          <Button onClick={() => navigate("/login")} className="w-full">
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đặt lại mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Mật khẩu mới"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<Lock className="text-gray-400" size={18} />}
            />
            <Input
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              icon={<Lock className="text-gray-400" size={18} />}
            />
          </div>
          <div>
            <Button
              type="submit"
              className="w-full"
              isLoading={loading}
              disabled={!password || password !== confirmPassword}
            >
              Cập nhật mật khẩu
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
