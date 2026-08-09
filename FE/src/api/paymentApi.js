import axiosClient from "./axiosClient";

const paymentApi = {
  getByOrderId: (orderId) =>
    axiosClient.get(`/payments/order/${orderId}`),

  submitTransactionRef: (orderId, transactionRef) =>
    axiosClient.post(`/payments/${orderId}/submit-transaction`, { transactionRef }),

  createQrPayment: (orderId, method, amount = 0) =>
    axiosClient.post(`/payments/${orderId}/qr`, { paymentMethod: method, amount }),

  confirmPayment: (orderId) =>
    axiosClient.post(`/admin/payments/${orderId}/confirm`),
};

export default paymentApi;
