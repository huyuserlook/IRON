import axiosClient from "./axiosClient";

const installmentApi = {
  create: (data) => axiosClient.post("/installment-requests", data),
  getMyRequests: (params) => axiosClient.get("/installment-requests/my-requests", { params }),
  getMyDetail: (requestId) => axiosClient.get(`/installment-requests/my-requests/${requestId}`),
  getAll: (params) => axiosClient.get("/admin/installment-requests", { params }),
  getDetail: (id) => axiosClient.get(`/admin/installment-requests/${id}`),
  updateStatus: (id, status, note = "") =>
    axiosClient.patch(`/admin/installment-requests/${id}`, null, { params: { status, note } }),
  delete: (id) => axiosClient.delete(`/admin/installment-requests/${id}`),
};

export default installmentApi;
