import axiosClient from "./axiosClient";

const authApi = {
  login: (data) => axiosClient.post("/auth/login", data),
  register: (data) => axiosClient.post("/auth/register", data),
  socialLogin: (data) => axiosClient.post("/auth/social-login", data),
  forgotPassword: (data) => axiosClient.post("/auth/forgot-password", data),
  resetPassword: (data) => axiosClient.post("/auth/reset-password", data),
  forgotPasswordByPhone: (data) => axiosClient.post("/auth/forgot-password/phone", data),
  resetPasswordByPhone: (data) => axiosClient.post("/auth/reset-password/phone", data),
  checkPasswordResetStatus: (phone) => axiosClient.get("/auth/password-reset/status", { params: { phone } }),
};

export default authApi;
