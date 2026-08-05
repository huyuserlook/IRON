import axiosClient from "./axiosClient";

const contactApi = {
  // Public
  create: (data) => axiosClient.post("/contacts", data),

  // Admin
  search: (params) => axiosClient.get("/admin/contacts", { params }),
  getNewCount: () => axiosClient.get("/admin/contacts/count-new"),
  updateStatus: (id, status) =>
    axiosClient.put(`/admin/contacts/${id}/status`, { status }),
  delete: (id) => axiosClient.delete(`/admin/contacts/${id}`),
};

export default contactApi;
