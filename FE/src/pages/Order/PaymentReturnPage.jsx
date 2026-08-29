import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const payosOrderCode = searchParams.get("orderCode");
  const status = searchParams.get("status");

  const [error, setError] = useState(null);

  useEffect(() => {
    if (!payosOrderCode) {
      setError("Thiếu thông tin đơn hàng");
      return;
    }

    const resolveOrderId = async () => {
      setTimeout(() => {
        navigate("/my-orders", { replace: true });
      }, 800);
    };

    resolveOrderId();
  }, [payosOrderCode, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F5FA] flex items-center justify-center text-[#1A1B1F] px-4">
        <div className="max-w-md rounded-[20px] border border-[#E3DEE6] bg-white p-8 text-center shadow-[0_16px_40px_-32px_rgba(0,0,0,0.16)]">
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <p className="mt-2 text-xs text-[#7A6E71]">
            Vui lòng quay lại trang đơn hàng để kiểm tra trạng thái.
          </p>
          <button
            type="button"
            onClick={() => navigate("/my-orders")}
            className="mt-4 inline-flex items-center justify-center rounded-[12px] bg-[#BC000A] px-5 py-2.5 text-sm font-bold text-white"
          >
            Về danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5FA] flex items-center justify-center text-[#1A1B1F]">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#E3DEE6] border-t-[#BC000A]" />
        <p className="mt-4 text-sm text-[#7A6E71]">Đang chuyển hướng về trang thanh toán...</p>
        {status === "PAID" && (
          <p className="mt-2 text-sm font-semibold text-green-700">Thanh toán thành công!</p>
        )}
      </div>
    </div>
  );
};

export default PaymentReturnPage;
