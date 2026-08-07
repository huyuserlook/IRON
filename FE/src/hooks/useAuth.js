import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, logout, register, socialLogin, updateProfile } from "../store/authSlice";
import { clearCart } from "../store/cartSlice";
import authApi from "../api/authApi";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, loading, error } = useSelector((state) => state.auth);

  const effectiveToken = token || localStorage.getItem("token");

  const handleLogin = async (data, redirectTo = "/") => {
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) {
      const role = result.payload.role;
      navigate(role === "ROLE_ADMIN" ? "/admin/dashboard" : redirectTo);
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

  const handleSocialLogin = async (data, redirectTo = "/") => {
    const result = await dispatch(socialLogin(data));
    if (socialLogin.fulfilled.match(result)) {
      const role = result.payload.role;
      navigate(role === "ROLE_ADMIN" ? "/admin/dashboard" : redirectTo);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
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

  const forgotPasswordByPhone = async (data) => {
    await authApi.forgotPasswordByPhone(data);
  };

  const checkPasswordResetStatus = async (phone) => {
    const response = await authApi.checkPasswordResetStatus(phone);
    return response?.data ?? response;
  };

  const resetPasswordByPhone = async (data) => {
    await authApi.resetPasswordByPhone(data);
  };

  const updateUser = async (data) => {
    const result = await dispatch(updateProfile(data));
    return updateProfile.fulfilled.match(result);
  };

  return {
    user,
    token: effectiveToken,
    loading,
    error,
    isAuthenticated: !!effectiveToken,
    isAdmin: user?.role === "ROLE_ADMIN",
    handleLogin,
    handleRegister,
    handleSocialLogin,
    handleLogout,
    handleForgotPassword,
    handleResetPassword,
    forgotPasswordByPhone,
    checkPasswordResetStatus,
    resetPasswordByPhone,
    updateUser,
  };
};
