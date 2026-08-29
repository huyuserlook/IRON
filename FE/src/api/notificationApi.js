import axiosClient from "./axiosClient";

const notificationApi = {
  getCount: () => axiosClient.get("/admin/notifications/count"),
  getRecent: (limit = 20) =>
    axiosClient.get("/admin/notifications", { params: { limit } }),
  markAllAsRead: () => axiosClient.post("/admin/notifications/mark-read"),
};

export default notificationApi;
