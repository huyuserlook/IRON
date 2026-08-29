import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { Lock, CheckCircle2, Eye, EyeOff } from "lucide-react";

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

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { handleResetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordChecks = useMemo(() => {
    const results = {};
    PASSWORD_RULES.forEach((rule) => {
      results[rule.key] = rule.test(password);
    });
    return results;
  }, [password]);

  const allPasswordRulesMet = useMemo(
    () => PASSWORD_RULES.every((rule) => rule.test(password)),
    [password]
  );

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = allPasswordRulesMet && passwordsMatch;

  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Vui lòng đảm bảo mật khẩu hợp lệ và khớp nhau");
      return;
    }

    setLoading(true);
    const result = await handleResetPassword({ token, newPassword: password });
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      toast.success("Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate("/login"), 3000);
    } else {
      toast.error(result.message || "Đặt lại mật khẩu thất bại");
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
            <div>
              <Input
                label="Mật khẩu mới"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

              {password && (
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
                            <CheckCircle2 size={12} className="text-green-600" />
                          ) : (
                            <span className="h-3 w-3 rounded-full border border-gray-300" />
                          )}
                          <span>{rule.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Xác nhận mật khẩu"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              icon={<Lock className="text-gray-400" size={18} />}
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
              className="w-full"
              isLoading={loading}
              disabled={!canSubmit || loading}
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
