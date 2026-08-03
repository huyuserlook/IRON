import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, logout, register, socialLogin } from "../store/authSlice";
import authApi from "../api/authApi";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (data) => {
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) {
      const role = result.payload.role;
      navigate(role === "ROLE_ADMIN" ? "/admin/dashboard" : "/");
      return true;
    }
    return false;
  };

  const handleRegister = async (data) => {
    const result = await dispatch(register(data));
    if (register.fulfilled.match(result)) {
      navigate("/login");
      return true;
    }
    return false;
  };

  const handleSocialLogin = async (data) => {
    const result = await dispatch(socialLogin(data));
    if (socialLogin.fulfilled.match(result)) {
      const role = result.payload.role;
      navigate(role === "ROLE_ADMIN" ? "/admin/dashboard" : "/");
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleForgotPassword = async (email) => {
    try {
      await authApi.forgotPassword({ email });
      return { success: true, message: "Yêu cầu đã được gửi" };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Lỗi" };
    }
  };

  const handleResetPassword = async (data) => {
    try {
      await authApi.resetPassword(data);
      return { success: true, message: "Đổi mật khẩu thành công" };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Lỗi" };
    }
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    isAdmin: user?.role === "ROLE_ADMIN",
    handleLogin,
    handleRegister,
    handleSocialLogin,
    handleLogout,
    handleForgotPassword,
    handleResetPassword,
  };
};
