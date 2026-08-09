import axiosClient from "./axiosClient";

const motorcycleApi = {
  // Khách hàng
  search: (params) => axiosClient.get("/motorcycles", { params }),
  getFeatured: () => axiosClient.get("/motorcycles/featured"),
  getBySlug: (slug) => axiosClient.get(`/motorcycles/${slug}`),
  getByIdPublic: (id) => axiosClient.get(`/motorcycles/id/${id}`),
  getSuggested: (id) => axiosClient.get(`/motorcycles/suggested/${id}`),

  // Admin
  getById: (id) => axiosClient.get(`/admin/motorcycles/${id}`),
  create: (data) => axiosClient.post("/admin/motorcycles", data),
  update: (id, data) => axiosClient.put(`/admin/motorcycles/${id}`, data),
  delete: (id) => axiosClient.delete(`/admin/motorcycles/${id}`),
};

export default motorcycleApi;
