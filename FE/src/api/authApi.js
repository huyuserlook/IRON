import axiosClient from "./axiosClient";

const authApi = {
  login: (data) => axiosClient.post("/auth/login", data),
  register: (data) => axiosClient.post("/auth/register", data),
  socialLogin: (data) => axiosClient.post("/auth/social-login", data),
  forgotPassword: (data) => axiosClient.post("/auth/forgot-password", data),
  resetPassword: (data) => axiosClient.post("/auth/reset-password", data),
};

export default authApi;
