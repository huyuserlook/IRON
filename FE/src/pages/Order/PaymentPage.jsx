import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import paymentApi from "../../api/paymentApi";
import orderApi from "../../api/orderApi";

const PaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const amountParam = searchParams.get("amount");

  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [qrCodeString, setQrCodeString] = useState(null);
  const [paid, setPaid] = useState(false);
  const [polling, setPolling] = useState(true);
  const [qrError, setQrError] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [payUrl, setPayUrl] = useState(null);
  const [payosOrderCode, setPayosOrderCode] = useState(null);
  const [fallbackPolling, setFallbackPolling] = useState(false);

  const amount = amountParam ? Number(amountParam) : 0;

  useEffect(() => {
    if (!orderId || !amount || isNaN(amount) || amount <= 0) {
      toast.error("Thieu thong tin don hang");
      navigate("/my-orders", { replace: true });
      return;
    }

    const initPayment = async () => {
      try {
        const statusRes = await orderApi.getStatus(orderId);
        const statusData = statusRes.data?.data || statusRes.data;
        const method = statusData?.paymentMethod;
        setPaymentMethod(method);

        if (method === "PAYOS") {
          const res = await paymentApi.createQrPayment(orderId, "PAYOS", amount);
          const data = res.data?.data || res.data;
          setQrCodeString(data.qrCode);
          setQrData(data.qrCodeUrl);
          setPayUrl(data.checkoutUrl || data.paymentUrl);
          setPayosOrderCode(data.orderCode || data.payosOrderCode || null);
        }
      } catch (err) {
        toast.error(err.message || "Loi khi tao QR thanh toan");
        navigate("/my-orders", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [orderId, amount, navigate]);

  useEffect(() => {
    if (!polling || !orderId || paid) return;
    const timer = setInterval(async () => {
      try {
        const res = await orderApi.getStatus(orderId);
        const data = res.data?.data || res.data;
        if (data?.status === "CONFIRMED" || data?.status === "COMPLETED" || data?.paymentStatus === "PAID" || data?.status === "paid") {
          setPaid(true);
          setPolling(false);
          setFallbackPolling(false);
          toast.success("Thanh toan thanh cong!");
          setTimeout(() => {
            navigate("/my-orders");
          }, 2000);
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [polling, orderId, paid, navigate]);

  /**
   * Fallback polling: nếu sau 30s DB vẫn chưa cập nhật (do webhook fail/ngrok đổi URL),
   * chủ động query PayOS API để lấy trạng thái thực tế và tự động cập nhật DB.
   */
  useEffect(() => {
    if (!fallbackPolling || !orderId || paid || !payosOrderCode) return;

    const fallbackTimer = setInterval(async () => {
      try {
        const res = await paymentApi.checkPayOSStatus(payosOrderCode);
        const data = res.data?.data || res.data;
        console.warn("[PaymentPage fallback] PayOS status for orderCode=" + payosOrderCode, data);

        const payosStatus = data?.status;
        const rawCode = data?.rawCode;

        if ("PAID".equalsIgnoreCase(payosStatus) || "00".equals(rawCode)) {
          setPaid(true);
          setPolling(false);
          setFallbackPolling(false);
          toast.success("Thanh toan thanh cong! (kiem tra tu PayOS)");
          setTimeout(() => {
            navigate("/my-orders");
          }, 2000);
        }
      } catch (err) {
        console.warn("[PaymentPage fallback] PayOS check failed:", err);
      }
    }, 5000);

    return () => clearInterval(fallbackTimer);
  }, [fallbackPolling, orderId, paid, payosOrderCode, navigate]);

  useEffect(() => {
    const fallbackDelay = setTimeout(() => {
      if (polling && !paid && payosOrderCode) {
        setFallbackPolling(true);
      }
    }, 30000);

    return () => clearTimeout(fallbackDelay);
  }, [polling, paid, payosOrderCode]);

  if (!orderId || !amount || isNaN(amount) || amount <= 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5FA] flex items-center justify-center text-[#1A1B1F]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#E3DEE6] border-t-[#BC000A]" />
          <p className="mt-4 text-sm text-[#7A6E71]">Dang tao ma QR thanh toan...</p>
        </div>
      </div>
    );
  }

  const isPayos = paymentMethod === "PAYOS";

  return (
    <div className="min-h-screen bg-[#F7F5FA] pb-16 text-[#1A1B1F]">
      <div className="mx-auto max-w-[560px] px-4 py-10 sm:px-6 lg:py-12">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#7A6E71] transition-colors hover:text-[#BC000A]"
        >
          <ArrowLeft size={16} />
          Quay lai
        </button>

        <div className="rounded-[20px] border border-[#E3DEE6] bg-white p-6 shadow-[0_16px_40px_-32px_rgba(0,0,0,0.16)]">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#BC000A] text-white">
              <CreditCard size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold">Thanh toan qua PayOS</h1>
              <p className="text-sm text-[#7A6E71]">Quet ma QR hoac mo link PayOS de thanh toan</p>
            </div>
          </div>

          {paid && (
            <div className="mb-6 flex items-center gap-3 rounded-[12px] bg-green-50 p-4 text-sm font-semibold text-green-700">
              <CheckCircle size={18} />
              Thanh toan thanh cong! Dang chuyen huong...
            </div>
          )}

          <div className="flex flex-col items-center gap-5">
            {isPayos && qrCodeString && (
              <div className="rounded-[16px] border-4 border-white bg-white p-3 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.2)]">
                <QRCodeSVG value={qrCodeString} size={256} />
              </div>
            )}

            {qrData && !qrError && !isPayos && (
              <div className="rounded-[16px] border-4 border-white bg-white p-3 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.2)]">
                <img
                  src={qrData}
                  alt="QR Code"
                  onError={() => setQrError(true)}
                  className="h-[260px] w-[260px] object-contain"
                />
              </div>
            )}

            {qrData && qrError && !isPayos && (
              <div className="w-full rounded-[12px] border border-red-200 bg-red-50 p-4 text-center">
                <p className="text-sm font-semibold text-red-700">
                  Khong the hien thi ma QR trong ung dung
                </p>
                <p className="mt-1 text-xs text-red-600">
                  Vui long mo link ben duoi de xem ma QR:
                </p>
                <a
                  href={qrData}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#BC000A] underline"
                >
                  Mo ma QR
                </a>
              </div>
            )}

            {isPayos && payUrl && (
              <a
                href={payUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#E3DEE6] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1B1F] shadow-sm transition-all duration-300 hover:border-[#BC000A] hover:text-[#BC000A]"
              >
                <ExternalLink size={14} />
                Mo link thanh toan PayOS
              </a>
            )}

            {!isPayos && qrData && (
              <a
                href={qrData}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#E3DEE6] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1B1F] shadow-sm transition-all duration-300 hover:border-[#BC000A] hover:text-[#BC000A]"
              >
                <ExternalLink size={14} />
                Mo ma QR trong tab moi
              </a>
            )}

            {isPayos && payUrl && (
              <a
                href={payUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#0066FF] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:brightness-110"
              >
                <ExternalLink size={14} />
                Mo link thanh toan PayOS
              </a>
            )}

            <div className="w-full rounded-[12px] border border-[#E3DEE6] bg-[#FAF8FC] p-4">
              <h3 className="text-sm font-bold text-[#1A1B1F]">Huong dan</h3>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-[#7A6E71]">
                <li>Quet ma QR ben tren hoac mo link PayOS de thanh toan</li>
                <li>Chon phuong thuc thanh toan ( ngan hang, vi dien tu...)</li>
                <li>Kiem tra thong tin va xac nhan thanh toan</li>
                <li>PayOS se tu dong cap nhat trang thai thanh toan</li>
                <li>Trang nay se tu chuyen huong khi thanh toan thanh cong</li>
              </ol>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#9A9196]">
              <RefreshCw size={13} className={polling ? "animate-spin" : ""} />
              Dang kiem tra trang thai thanh toan...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;