import axiosClient from "./axiosClient";

const adminApi = {
  getStatistics: (params) => axiosClient.get("/admin/statistics", { params }),
};

export default adminApi;
