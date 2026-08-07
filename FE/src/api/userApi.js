import axiosClient from "./axiosClient";

const userApi = {
  getProfile: () => axiosClient.get("/users/profile"),
  updateProfile: (data) => axiosClient.put("/users/profile", data),
  getAllAdmin: (params) => axiosClient.get("/admin/users", { params }),
  toggleStatus: (id) => axiosClient.patch(`/admin/users/${id}/toggle-status`),
  delete: (id) => axiosClient.delete(`/admin/users/${id}`),
  approvePasswordReset: (id) => axiosClient.post(`/admin/users/${id}/approve-password-reset`),
  getPasswordResetRequests: (params) => axiosClient.get("/admin/users/password-reset-requests", { params }),
};

export default userApi;
