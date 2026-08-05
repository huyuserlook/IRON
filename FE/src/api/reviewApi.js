import axiosClient from "./axiosClient";

const reviewApi = {
  // Public
  create: (data) => axiosClient.post("/reviews", data),

  // Admin
  search: (params) => axiosClient.get("/admin/reviews", { params }),
  getNewCount: () => axiosClient.get("/admin/reviews/new-count"),
  getNew: (limit = 10) =>
    axiosClient.get("/admin/reviews/new", { params: { limit } }),
  updateStatus: (id, status) =>
    axiosClient.put(`/admin/reviews/${id}/status`, { status }),
  delete: (id) => axiosClient.delete(`/admin/reviews/${id}`),
};

export default reviewApi;
