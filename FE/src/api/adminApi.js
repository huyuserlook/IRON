import axiosClient from "./axiosClient";

const adminApi = {
  getStatistics: () => axiosClient.get("/admin/statistics"),
};

export default adminApi;
