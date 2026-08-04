import axiosClient from "./axiosClient";

const reviewApi = {
  search: (params) => axiosClient.get("/admin/reviews", { params }),
  updateStatus: (id, status) =>
    axiosClient.put(`/admin/reviews/${id}/status`, { status }),
  delete: (id) => axiosClient.delete(`/admin/reviews/${id}`),
};

export default reviewApi;
