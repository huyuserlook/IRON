import axiosClient from "./axiosClient";

const categoryApi = {
  getAll: () => axiosClient.get("/categories"),
  getById: (id) => axiosClient.get(`/categories/${id}`),

  // Admin
  getAllAdmin: () => axiosClient.get("/admin/categories"),
  create: (data) => axiosClient.post("/admin/categories", data),
  update: (id, data) => axiosClient.put(`/admin/categories/${id}`, data),
  delete: (id) => axiosClient.delete(`/admin/categories/${id}`),
};

export default categoryApi;
