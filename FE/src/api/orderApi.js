import axiosClient from "./axiosClient";

const orderApi = {
  create: (data) => axiosClient.post("/orders", data),
  getMyOrders: (params) => axiosClient.get("/orders/my-orders", { params }),
  getByCode: (orderCode) => axiosClient.get(`/orders/${orderCode}`),
  cancel: (id) => axiosClient.patch(`/orders/${id}/cancel`),
  getStatus: (id) => axiosClient.get(`/orders/${id}/status`),

  // Admin
  getAllAdmin: (params) => axiosClient.get("/admin/orders", { params }),
  getByIdAdmin: (id) => axiosClient.get(`/admin/orders/${id}`),
  updateStatus: (id, status) =>
    axiosClient.patch(`/admin/orders/${id}/status`, null, {
      params: { status },
    }),
  deleteOrder: (id) => axiosClient.delete(`/admin/orders/${id}`),
};

export default orderApi;
