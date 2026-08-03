import axiosClient from "./axiosClient";

const brandApi = {
  getAll: () => axiosClient.get("/brands"),
  getById: (id) => axiosClient.get(`/brands/${id}`),

  // Admin
  getAllAdmin: () => axiosClient.get("/admin/brands"),
  create: (data) => axiosClient.post("/admin/brands", data),
  update: (id, data) => axiosClient.put(`/admin/brands/${id}`, data),
  delete: (id) => axiosClient.delete(`/admin/brands/${id}`),
};

export default brandApi;
