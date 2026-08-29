import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { Phone, ArrowLeft, ShieldCheck, Lock, Check, X, Eye, EyeOff } from "lucide-react";

const phoneRegex = /^[0-9]{9,11}$/;

const PASSWORD_RULES = [
  { key: "length", label: "Tối thiểu 8 ký tự", test: (p) => p.length >= 8 },
  { key: "upper", label: "Ít nhất 1 chữ hoa (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { key: "lower", label: "Ít nhất 1 chữ thường (a-z)", test: (p) => /[a-z]/.test(p) },
  { key: "digit", label: "Ít nhất 1 chữ số (0-9)", test: (p) => /\d/.test(p) },
  { key: "special", label: "Ít nhất 1 ký tự đặc biệt (@#$%^&*!)", test: (p) => /[@#$%^&*!]/.test(p) },
];

const getStrength = (password) => {
  if (!password) return { level: 0, label: "", color: "" };
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed <= 2) return { level: 1, label: "Yếu", color: "bg-red-500" };
  if (passed <= 4) return { level: 2, label: "Trung bình", color: "bg-yellow-500" };
  return { level: 3, label: "Mạnh", color: "bg-green-500" };
};

const ForgotPasswordPage = () => {
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [approved, setApproved] = useState(null);
  const [polling, setPolling] = useState(false);
  const { forgotPasswordByPhone, resetPasswordByPhone, checkPasswordResetStatus } = useAuth();
  const location = useLocation();

  const phoneValid = phoneRegex.test(phone);

  const passwordChecks = useMemo(() => {
    const results = {};
    PASSWORD_RULES.forEach((rule) => {
      results[rule.key] = rule.test(newPassword);
    });
    return results;
  }, [newPassword]);

  const allPasswordRulesMet = useMemo(
    () => PASSWORD_RULES.every((rule) => rule.test(newPassword)),
    [newPassword]
  );

  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canReset = allPasswordRulesMet && passwordsMatch;

  const strength = getStrength(newPassword);

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
    if (!canReset) {
      toast.error("Vui lòng đảm bảo mật khẩu hợp lệ và khớp nhau");
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

            <div>
              <Input
                label="Mật khẩu mới"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                icon={<Lock className="text-gray-400" size={18} />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              {newPassword && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${(strength.level / 3) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 min-w-[70px] text-right">
                      {strength.label}
                    </span>
                  </div>

                  <div className="grid gap-1.5">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = passwordChecks[rule.key];
                      return (
                        <div
                          key={rule.key}
                          className={`flex items-center gap-2 text-[11px] transition-colors ${
                            passed ? "text-green-700" : "text-gray-500"
                          }`}
                        >
                          {passed ? (
                            <Check size={12} className="text-green-600" />
                          ) : (
                            <X size={12} className="text-gray-400" />
                          )}
                          <span>{rule.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Input
                label="Xác nhận mật khẩu"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                icon={<Lock className="text-gray-400" size={18} />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={
                  confirmPassword && !passwordsMatch
                    ? "Mật khẩu không khớp"
                    : ""
                }
              />
            </div>

            <div>
              <Button
                type="submit"
                className="w-full rounded-full bg-iron-yellow text-black font-semibold py-3 hover:brightness-95"
                isLoading={loading}
                disabled={!canReset || loading}
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
