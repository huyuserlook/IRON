import { useState, useEffect } from "react";
import depositApi from "../../api/depositApi";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { X, ShieldCheck, Info, CreditCard, Banknote, QrCode, ExternalLink } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

const DepositModal = ({ isOpen, onClose, motorcycle, orderId, onSuccess }) => {
  const { isAuthenticated } = useAuth();
  const [depositAmount, setDepositAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [calculated, setCalculated] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [qrData, setQrData] = useState(null);
  const [payUrl, setPayUrl] = useState(null);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [depositId, setDepositId] = useState(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (isOpen && motorcycle) {
      const defaultAmount = motorcycle.price * 0.1;
      setDepositAmount(Math.round(defaultAmount));
      setPaymentMethod("CASH");
      setQrData(null);
      setPayUrl(null);
      setDepositSuccess(false);
      setDepositId(null);
      setPolling(false);
    }
  }, [isOpen, motorcycle]);

  useEffect(() => {
    if (!motorcycle) return;
    const amount = Number(depositAmount) || 0;
    const remaining = Math.max(motorcycle.price - amount, 0);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    setCalculated({
      depositAmount: amount,
      remaining,
      total: motorcycle.price,
      deadline: deadline.toISOString(),
    });
  }, [depositAmount, motorcycle]);

  useEffect(() => {
    if (!depositSuccess || !depositId || paymentMethod !== "PAYOS" || !polling) return;
    const timer = setInterval(async () => {
      try {
        const res = await depositApi.getDetail(depositId);
        const payload = res?.data?.data ?? res?.data;
        if (payload && (payload.status === "DEPOSITED" || payload.status === "COMPLETED")) {
          setPolling(false);
          toast.success("Thanh toán cọc thành công!");
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 1500);
        }
      } catch {
        // ignore poll errors
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [depositSuccess, depositId, paymentMethod, polling, onSuccess, onClose]);

  if (!isOpen || !motorcycle) return null;

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đặt cọc");
      onClose();
      return;
    }

    const amount = Number(depositAmount);
    if (amount <= 0) {
      toast.error("Số tiền cọc phải lớn hơn 0");
      return;
    }
    if (amount > motorcycle.price) {
      toast.error("Số tiền cọc không được vượt quá tổng giá trị xe");
      return;
    }

    setLoading(true);
    try {
      const res = await depositApi.create({ orderId, depositAmount: amount, paymentMethod });
      const payload = res?.data?.data ?? res?.data;

      if (paymentMethod === "PAYOS" && payload) {
        setDepositId(payload.id || null);
        setQrData(payload.qrCodeUrl || payload.qrCode || null);
        setPayUrl(payload.paymentUrl || payload.checkoutUrl || null);
        setDepositSuccess(true);
        setPolling(true);
        toast.success("Đặt cọc thành công! Vui lòng quét mã QR để thanh toán.");
      } else {
        toast.success("Đặt cọc thành công! Vui lòng thanh toán tại showroom.");
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      toast.error(err?.message || "Không thể đặt cọc");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayUrl = () => {
    if (payUrl) {
      window.open(payUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-orange-500" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Đặt cọc giữ xe</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 rounded-xl bg-orange-50 p-4">
          <p className="text-sm text-gray-600">Xe: <span className="font-semibold text-gray-800">{motorcycle.name}</span></p>
          <p className="text-sm text-gray-600">Giá xe: <span className="font-semibold text-gray-800">{formatCurrency(motorcycle.price)}</span></p>
        </div>

        {calculated && !depositSuccess && (
          <div className="mb-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền cọc (VND)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min={1}
                max={motorcycle.price}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                Nhập số tiền bạn muốn đặt cọc
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán cọc</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                    paymentMethod === "CASH"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 text-gray-600 hover:border-orange-300"
                  }`}
                >
                  <Banknote size={16} />
                  Tiền mặt
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("PAYOS")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                    paymentMethod === "PAYOS"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 text-gray-600 hover:border-orange-300"
                  }`}
                >
                  <CreditCard size={16} />
                  Chuyển khoản
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs text-gray-500">Số tiền còn lại</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(calculated.remaining)}</p>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-xs text-gray-500">Hạn thanh toán nốt</p>
                <p className="text-sm font-semibold text-green-700">
                  {new Date(calculated.deadline).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800">
              <Info size={14} className="mt-0.5 shrink-0" />
              <p>
                Sau khi đặt cọc, xe sẽ được giữ chỗ trong <span className="font-semibold">7 ngày</span>. 
                Bạn cần thanh toán phần còn lại trước hạn để hoàn tất đơn hàng.
              </p>
            </div>
          </div>
        )}

        {depositSuccess && paymentMethod === "PAYOS" && (
          <div className="mb-4 rounded-xl border border-orange-100 bg-orange-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-orange-700 mb-3">
              <QrCode size={18} />
              Quét mã QR để thanh toán tiền cọc
            </div>
            {qrData ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={qrData}
                  alt="QR PayOS"
                  className="h-48 w-48 rounded-xl border border-orange-200 bg-white p-2"
                />
                <button
                  type="button"
                  onClick={handleOpenPayUrl}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  <ExternalLink size={16} />
                  Mở trang thanh toán
                </button>
                <p className="text-xs text-orange-600">
                  Đang chờ thanh toán... Trạng thái sẽ tự động cập nhật.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                {payUrl ? (
                  <button
                    type="button"
                    onClick={handleOpenPayUrl}
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                  >
                    <ExternalLink size={16} />
                    Mở trang thanh toán
                  </button>
                ) : (
                  <p className="text-sm text-orange-600">Đang tạo mã QR...</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading || depositSuccess}
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {depositSuccess ? "Đóng" : "Hủy"}
          </button>
          {!depositSuccess && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Xác nhận đặt cọc"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
