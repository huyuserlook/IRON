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

  /**
   * Fallback: chủ động query PayOS để lấy trạng thái thực tế của đơn hàng.
   * Dùng khi webhook bị fail/ngrok đổi URL mà DB vẫn chưa cập nhật.
   * Backend endpoint: GET /api/payos/check-status/{orderCode}
   */
  checkPayOSStatus: (orderCode) =>
    axiosClient.get(`/payos/check-status/${encodeURIComponent(orderCode)}`),
};

export default paymentApi;
