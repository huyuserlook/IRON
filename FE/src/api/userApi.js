import axiosClient from "./axiosClient";

const userApi = {
  getProfile: () => axiosClient.get("/users/profile"),
  getAllAdmin: (params) => axiosClient.get("/admin/users", { params }),
  toggleStatus: (id) => axiosClient.patch(`/admin/users/${id}/toggle-status`),
  delete: (id) => axiosClient.delete(`/admin/users/${id}`),
};

export default userApi;
