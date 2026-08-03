import axiosClient from "./axiosClient";

const bookingApi = {
  create: (data) => axiosClient.post("/bookings", data),
  getMyBookings: (params) =>
    axiosClient.get("/bookings/my-bookings", { params }),
  cancel: (id) => axiosClient.patch(`/bookings/${id}/cancel`),

  // Admin
  getAllAdmin: (params) => axiosClient.get("/admin/bookings", { params }),
  updateStatus: (id, status) =>
    axiosClient.patch(`/admin/bookings/${id}/status`, null, {
      params: { status },
    }),
};

export default bookingApi;
