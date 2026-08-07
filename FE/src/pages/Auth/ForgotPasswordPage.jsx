import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { Phone, ArrowLeft, ShieldCheck, Lock } from "lucide-react";

const phoneRegex = /^[0-9]{9,11}$/;

const ForgotPasswordPage = () => {
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [approved, setApproved] = useState(null);
  const [polling, setPolling] = useState(false);
  const { forgotPasswordByPhone, resetPasswordByPhone, checkPasswordResetStatus } = useAuth();
  const location = useLocation();

  const phoneValid = phoneRegex.test(phone);
  const passwordValid = newPassword.length >= 6 && newPassword === confirmPassword;

  useEffect(() => {
    if (!polling) return;
    const timer = setInterval(async () => {
      try {
        const data = await checkPasswordResetStatus(phone);
        if (data?.resetTokenApproved === true) {
          setApproved(true);
          setStep(2);
          setPolling(false);
          toast.success("Yêu cầu đã được admin duyệt. Vui lòng đặt mật khẩu mới.");
        }
      } catch {
        // ignore poll errors
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [polling, phone, checkPasswordResetStatus]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!phoneValid) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ");
      return;
    }
    setLoading(true);
    try {
      await forgotPasswordByPhone({ phone });
      setApproved(false);
      setStep(2);
      setPolling(true);
      toast.success("Đã gửi yêu cầu. Đang chờ admin duyệt...");
    } catch {
      toast.error("Không thể gửi yêu cầu. Vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwordValid) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự và khớp nhau");
      return;
    }
    setLoading(true);
    setPolling(false);
    try {
      await resetPasswordByPhone({ phone, newPassword });
      setSubmitted(true);
      setApproved(null);
      toast.success("Mật khẩu đã được đặt lại thành công");
    } catch {
      toast.error("Yêu cầu đặt lại mật khẩu chưa được admin xác nhận hoặc đã hết hạn");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#fbfaf9,#f3efe8)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full text-center space-y-6 bg-white p-10 rounded-3xl shadow-lg border">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-50">
            <ShieldCheck className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Đặt lại mật khẩu thành công
          </h2>
          <p className="text-gray-600">
            Bạn có thể đăng nhập bằng mật khẩu mới.
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
            <Phone className="h-6 w-6 text-yellow-600" />
          </div>
          <h2 className="mt-4 text-center text-2xl font-extrabold text-gray-900">
            Quên mật khẩu?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nhập số điện thoại để yêu cầu đặt lại mật khẩu.
          </p>
        </div>

        {step === 1 ? (
          <form className="mt-6 space-y-4" onSubmit={handleRequestOtp} noValidate>
            <Input
              label="Số điện thoại"
              type="tel"
              placeholder="0905123456"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
              required
              icon={<Phone className="text-gray-400" size={18} />}
              helperText={!phone ? "" : phoneValid ? "" : "Số điện thoại phải có 9-11 chữ số"}
            />

            <div>
              <Button
                type="submit"
                className="w-full rounded-full bg-iron-yellow text-black font-semibold py-3 hover:brightness-95"
                isLoading={loading}
                disabled={!phoneValid || loading}
              >
                Gửi yêu cầu
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
        ) : approved ? (
          <form className="mt-6 space-y-4" onSubmit={handleResetPassword} noValidate>
            <div className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
              Yêu cầu đặt lại mật khẩu đã được admin duyệt. Vui lòng nhập mật khẩu mới.
            </div>

            <Input
              label="Mật khẩu mới"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              icon={<Lock className="text-gray-400" size={18} />}
              helperText={newPassword ? (newPassword.length >= 6 ? "" : "Mật khẩu phải có ít nhất 6 ký tự") : ""}
            />

            <Input
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              icon={<Lock className="text-gray-400" size={18} />}
              helperText={confirmPassword ? (confirmPassword === newPassword ? "" : "Mật khẩu không khớp") : ""}
            />

            <div>
              <Button
                type="submit"
                className="w-full rounded-full bg-iron-yellow text-black font-semibold py-3 hover:brightness-95"
                isLoading={loading}
                disabled={!passwordValid || loading}
              >
                Đặt lại mật khẩu
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setStep(1); setApproved(null); }}
                className="inline-flex items-center text-sm text-gray-600 hover:text-orange-500 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Đổi số điện thoại khác
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800 border border-yellow-200">
              {polling ? "Đang chờ admin duyệt... Trang sẽ tự động chuyển khi được duyệt." : "Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng chờ admin xác nhận."}
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setStep(1); setPolling(false); setApproved(null); }}
                className="inline-flex items-center text-sm text-gray-600 hover:text-orange-500 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Đổi số điện thoại khác
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
