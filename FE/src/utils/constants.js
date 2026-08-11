export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const ORDER_STATUS = {
  PENDING: { label: "Chờ xác nhận", color: "yellow" },
  CONFIRMED: { label: "Đã xác nhận", color: "blue" },
  PROCESSING: { label: "Đang xử lý", color: "purple" },
  SHIPPING: { label: "Đang giao", color: "orange" },
  DELIVERED: { label: "Đã giao", color: "green" },
  CANCELLED: { label: "Đã hủy", color: "red" },
  REFUNDED: { label: "Hoàn tiền", color: "gray" },
  DEPOSITED: { label: "Đã đặt cọc", color: "orange" },
  AWAITING_FINAL_PAYMENT: { label: "Chờ thanh toán nốt", color: "amber" },
  COMPLETED: { label: "Hoàn thành", color: "green" },
};

export const BOOKING_STATUS = {
  PENDING: { label: "Chờ xác nhận", color: "yellow" },
  CONFIRMED: { label: "Đã xác nhận", color: "blue" },
  COMPLETED: { label: "Hoàn thành", color: "green" },
  CANCELLED: { label: "Đã hủy", color: "red" },
};

export const MOTORCYCLE_STATUS = {
  AVAILABLE: { label: "Còn hàng", color: "green" },
  OUT_OF_STOCK: { label: "Hết hàng", color: "red" },
  COMING_SOON: { label: "Sắp ra mắt", color: "blue" },
  DISCONTINUED: { label: "Ngừng sản xuất", color: "gray" },
};

export const PAYMENT_METHOD = {
  CASH: "Tiền mặt",
  PAYOS: "PayOS",
};

export const PAYMENT_STATUS = {
  PAID: { label: "Đã thanh toán", color: "green" },
  PENDING: { label: "Chưa thanh toán", color: "orange" },
  FAILED: { label: "Thanh toán thất bại", color: "red" },
  REFUNDED: { label: "Đã hoàn tiền", color: "gray" },
};

export const PAGE_SIZE = 12;
