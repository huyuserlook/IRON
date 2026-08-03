export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat("vi-VN").format(num);
};
