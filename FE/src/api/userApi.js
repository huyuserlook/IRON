import axiosClient from "./axiosClient";

const userApi = {
  getProfile: () => axiosClient.get("/users/profile"),
  updateProfile: (data) => axiosClient.put("/users/profile", data),
  getAllAdmin: (params) => axiosClient.get("/admin/users", { params }),
  toggleStatus: (id) => axiosClient.patch(`/admin/users/${id}/toggle-status`),
  delete: (id) => axiosClient.delete(`/admin/users/${id}`),
  approvePasswordReset: (id) => axiosClient.post(`/admin/users/${id}/approve-password-reset`),
  getPasswordResetRequests: (params) => axiosClient.get("/admin/users/password-reset-requests", { params }),
  updateRole: (id, role, note = "") => axiosClient.patch(`/admin/users/${id}/role`, null, { params: { role, note } }),
  getStaff: (params) => axiosClient.get("/admin/users/staff", { params }),
  createStaff: (data) => axiosClient.post("/admin/users/staff", data),
  toggleStaffStatus: (id) => axiosClient.patch(`/admin/users/staff/${id}/toggle-status`),
  deleteStaff: (id) => axiosClient.delete(`/admin/users/staff/${id}`),
};

export default userApi;
