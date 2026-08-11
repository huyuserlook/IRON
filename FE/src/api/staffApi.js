import axiosClient from "./axiosClient";

const staffApi = {
  getOrders: (params) => axiosClient.get("/staff/orders", { params }),
  getOrder: (id) => axiosClient.get(`/staff/orders/${id}`),
  updateOrderStatus: (id, status) => axiosClient.patch(`/staff/orders/${id}/status`, null, { params: { status } }),
  getBookings: (params) => axiosClient.get("/staff/bookings", { params }),
  getBooking: (id) => axiosClient.get(`/staff/bookings/${id}`),
  updateBookingStatus: (id, status) => axiosClient.patch(`/staff/bookings/${id}/status`, null, { params: { status } }),
  getMotorcycles: (params) => axiosClient.get("/staff/motorcycles", { params }),
};

export default staffApi;
