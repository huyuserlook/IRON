import axiosClient from "./axiosClient";

const depositApi = {
  create: (data) => axiosClient.post("/deposits", data),
  getMyDeposits: (params) => axiosClient.get("/deposits/my-deposits", { params }),
  getDetail: (depositId) => axiosClient.get(`/deposits/${depositId}`),
  getDepositByOrderId: (orderId) => axiosClient.get(`/deposits/order/${orderId}`),
  payRemaining: (depositId) => axiosClient.post(`/deposits/${depositId}/pay-remaining`),
  getAll: (params) => axiosClient.get("/deposits/admin/all", { params }),
  getDetailAdmin: (id) => axiosClient.get(`/deposits/admin/${id}`),
  updateStatus: (id, status, note = "") => axiosClient.patch(`/deposits/admin/${id}/status`, null, { params: { status, note } }),
  refund: (id, note = "") => axiosClient.post(`/deposits/admin/${id}/refund`, null, { params: { note } }),
};

export default depositApi;
