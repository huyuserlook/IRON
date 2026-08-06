import axiosClient from "./axiosClient";

const paymentApi = {
  getByOrderId: (orderId) =>
    axiosClient.get(`/payments/order/${orderId}`),

  submitTransactionRef: (orderId, transactionRef) =>
    axiosClient.post(`/payments/${orderId}/submit-transaction`, { transactionRef }),

  confirmVietQrPayment: (orderId) =>
    axiosClient.post(`/checkout/orders/${orderId}/confirm`),

  createVietQr: (orderId, amount) =>
    axiosClient.post(`/checkout/vietqr`, { orderId, amount }),

  createMomoPayment: (orderId, amount, orderInfo) =>
    axiosClient.post(`/checkout/momo`, { orderId: String(orderId), amount, orderInfo }),
};

export default paymentApi;
