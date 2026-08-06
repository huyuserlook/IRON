import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Copy,
  ExternalLink,
  QrCode,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import toast from "react-hot-toast";
import paymentApi from "../../api/paymentApi";
import orderApi from "../../api/orderApi";
import { formatCurrency } from "../../utils/formatCurrency";

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(
  /\/api\/?$/,
  "",
);

const resolveImageUrl = (url) => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  if (url.startsWith("/")) return `${API_ROOT}${url}`;
  return `${API_ROOT}/${url}`;
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const amountParam = searchParams.get("amount");

  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [bankInfo, setBankInfo] = useState(null);
  const [paid, setPaid] = useState(false);
  const [polling, setPolling] = useState(true);
  const [qrError, setQrError] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [deeplink, setDeeplink] = useState(null);
  const [payUrl, setPayUrl] = useState(null);

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
        const code = statusData?.orderCode;
        setPaymentMethod(method);

        if (method === "MOMO") {
          const res = await paymentApi.createMomoPayment(
            orderId,
            amount,
            `Thanh toán đơn hàng ${code || orderId}`
          );
          const data = res.data?.data || res.data;
          setQrData(data.qrCodeUrl);
          setDeeplink(data.deeplink);
          setPayUrl(data.payUrl);
        } else {
          const res = await paymentApi.createVietQr(orderId, amount);
          const data = res.data?.data || res.data;
          const bankInfoData = data.bankInfo || {};
          const qrUrl = data.qrCodeUrl ? resolveImageUrl(data.qrCodeUrl) : null;
          setQrData(qrUrl);
          setBankInfo({
            account: bankInfoData.account || "161220054444",
            bankName: bankInfoData.bankName || "MB",
            accountName: bankInfoData.accountName || "HO XUAN HUY",
            amount: bankInfoData.amount || amount,
            addInfo: bankInfoData.addInfo || "DH" + orderId,
          });
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
        if (data?.status === "CONFIRMED" || data?.paymentStatus === "PAID" || data?.status === "paid") {
          setPaid(true);
          setPolling(false);
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

  const handleCopyBankInfo = () => {
    if (bankInfo) {
      const parts = [
        bankInfo.accountName,
        bankInfo.account,
        bankInfo.bankName,
        bankInfo.amount ? formatCurrency(bankInfo.amount) : null,
        bankInfo.addInfo,
      ].filter(Boolean);
      navigator.clipboard.writeText(parts.join(" - "));
      toast.success("Da sao chep thong tin");
    }
  };

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

  const isMomo = paymentMethod === "MOMO";

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
              {isMomo ? <Smartphone size={18} /> : <QrCode size={18} />}
            </div>
            <div>
              <h1 className="text-lg font-bold">
                {isMomo ? "Thanh toan qua MoMo" : "Thanh toan chuyen khoan"}
              </h1>
              <p className="text-sm text-[#7A6E71]">
                {isMomo
                  ? "Quet ma QR hoac mo app MoMo de thanh toan"
                  : "Quet ma QR hoac chuyen khoan thu cong"}
              </p>
            </div>
          </div>

          {paid && (
            <div className="mb-6 flex items-center gap-3 rounded-[12px] bg-green-50 p-4 text-sm font-semibold text-green-700">
              <CheckCircle size={18} />
              Thanh toan thanh cong! Dang chuyen huong...
            </div>
          )}

          <div className="flex flex-col items-center gap-5">
            {qrData && !qrError && (
              <div className="rounded-[16px] border-4 border-white bg-white p-3 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.2)]">
                <img
                  src={qrData}
                  alt="QR Code"
                  onError={() => setQrError(true)}
                  className="h-[260px] w-[260px] object-contain"
                />
              </div>
            )}

            {qrData && qrError && (
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

            {qrData && (
              <a
                href={qrData}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#E3DEE6] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1B1F] shadow-sm transition-all duration-300 hover:border-[#BC000A] hover:text-[#BC000A]"
              >
                <ExternalLink size={14} />
                {isMomo ? "Mo ma QR trong tab moi" : "Mo ma QR trong tab moi"}
              </a>
            )}

            {isMomo && deeplink && (
              <a
                href={deeplink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#C82A44] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:brightness-110"
              >
                <Smartphone size={16} />
                Mo app MoMo de thanh toan
              </a>
            )}

            {isMomo && payUrl && (
              <a
                href={payUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#E3DEE6] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1B1F] shadow-sm transition-all duration-300 hover:border-[#BC000A] hover:text-[#BC000A]"
              >
                <ExternalLink size={14} />
                Mo trang thanh toan MoMo
              </a>
            )}

            {!isMomo && bankInfo && (
              <div className="w-full rounded-[12px] bg-[#F7F5FA] p-4 space-y-3">
                <h3 className="text-sm font-bold text-[#1A1B1F]">
                  Thong tin chuyen khoan
                </h3>
                <div className="grid gap-2 text-sm">
                  {bankInfo.accountName && (
                    <div className="flex justify-between">
                      <span className="text-[#7A6E71]">Chu tai khoan</span>
                      <span className="font-semibold text-[#1A1B1F]">
                        {bankInfo.accountName}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#7A6E71]">So tai khoan</span>
                    <span className="font-semibold text-[#1A1B1F]">
                      {bankInfo.account}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A6E71]">Ngan hang</span>
                    <span className="font-semibold text-[#1A1B1F]">
                      {bankInfo.bankName}
                    </span>
                  </div>
                  {bankInfo.amount && (
                    <div className="flex justify-between">
                      <span className="text-[#7A6E71]">So tien</span>
                      <span className="font-semibold text-[#BC000A]">
                        {formatCurrency(bankInfo.amount)}
                      </span>
                    </div>
                  )}
                  {bankInfo.addInfo && (
                    <div className="flex justify-between">
                      <span className="text-[#7A6E71]">Noi dung CK</span>
                      <span className="font-semibold text-[#1A1B1F]">
                        {bankInfo.addInfo}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCopyBankInfo}
                  className="flex items-center gap-2 text-sm font-medium text-[#BC000A] hover:text-[#8B000A] transition-colors"
                >
                  <Copy size={14} />
                  Sao chep thong tin
                </button>

                {!isMomo && (
                  <>
                    <p className="text-xs text-[#7A6E71]">
                      Sau khi chuyen khoan xong, bam nut ben duoi de xac nhan
                    </p>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await paymentApi.confirmVietQrPayment(orderId);
                          setPaid(true);
                          setPolling(false);
                          toast.success("Xac nhan thanh toan thanh cong!");
                          setTimeout(() => {
                            navigate("/my-orders");
                          }, 2000);
                        } catch (err) {
                          toast.error(err.message || "Xac nhan that bai");
                        }
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#BC000A] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_-20px_rgba(188,0,10,0.7)] transition-all duration-300 hover:brightness-110"
                    >
                      Da thanh toan
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="w-full rounded-[12px] border border-[#E3DEE6] bg-[#FAF8FC] p-4">
              <h3 className="text-sm font-bold text-[#1A1B1F]">Huong dan</h3>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-[#7A6E71]">
                {isMomo ? (
                  <>
                    <li>Mo app MoMo va quet ma QR ben tren</li>
                    <li>Kiem tra thong tin va xac nhan thanh toan</li>
                    <li>MoMo se tu dong cap nhat trang thai thanh toan</li>
                    <li>Trang nay se tu chuyen huong khi thanh toan thanh cong</li>
                  </>
                ) : (
                  <>
                    <li>Mo app ngan hang va chon chuc nang quet ma QR</li>
                    <li>Quet ma QR ben tren</li>
                    <li>Kiem tra thong tin va xac nhan chuyen khoan</li>
                    <li>Trang nay se tu cap nhat khi thanh toan thanh cong</li>
                  </>
                )}
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