import { useState, useEffect } from "react";
import installmentApi from "../../api/installmentApi";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { X, FileText } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

const MONTHLY_INCOME_OPTIONS = [
  { value: "UNDER_5M", label: "Dưới 5 triệu" },
  { value: "BETWEEN_5M_10M", label: "5 - 10 triệu" },
  { value: "BETWEEN_10M_20M", label: "10 - 20 triệu" },
  { value: "ABOVE_20M", label: "Trên 20 triệu" },
];

const INSTALLMENT_MONTHS = [6, 12, 18, 24];

const InstallmentModal = ({ isOpen, onClose, motorcycle, onSuccess }) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    idCardNumber: "",
    monthlyIncome: "",
    downPayment: "",
    installmentMonths: 12,
    customerNote: "",
  });

  useEffect(() => {
    if (isOpen && motorcycle) {
      const defaultDownPayment = Math.round(motorcycle.price * 0.2);
      setForm({
        fullName: user?.fullName || "",
        phone: user?.phone || "",
        email: user?.email || "",
        idCardNumber: "",
        monthlyIncome: "",
        downPayment: String(defaultDownPayment),
        installmentMonths: 12,
        customerNote: "",
      });
    }
  }, [isOpen, motorcycle, user]);

  if (!isOpen || !motorcycle) return null;

  const handleChange = (field) => (e) => {
    setForm((s) => ({ ...s, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return;
    }
    if (!/^0\d{9}$/.test(form.phone)) {
      toast.error("Số điện thoại phải gồm 10 số và bắt đầu bằng 0");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Email không hợp lệ");
      return;
    }
    if (!/^\d{9}$/.test(form.idCardNumber) && !/^\d{12}$/.test(form.idCardNumber)) {
      toast.error("CMND/CCCD phải gồm 9 hoặc 12 số");
      return;
    }
    if (!form.monthlyIncome) {
      toast.error("Vui lòng chọn mức thu nhập");
      return;
    }
    const downPayment = Number(form.downPayment);
    if (isNaN(downPayment) || downPayment < 0) {
      toast.error("Số tiền trả trước không hợp lệ");
      return;
    }

    setSubmitting(true);
    try {
      await installmentApi.create({
        motorcycleId: motorcycle.id,
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        idCardNumber: form.idCardNumber,
        monthlyIncome: form.monthlyIncome,
        downPayment,
        installmentMonths: Number(form.installmentMonths),
        customerNote: form.customerNote,
      });
      toast.success("Đăng ký trả góp thành công! Chúng tôi sẽ liên hệ tư vấn trong 24h.");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || "Không thể đăng ký trả góp");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Đăng ký trả góp</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 rounded-xl bg-blue-50 p-4">
          <p className="text-sm text-gray-600">Xe: <span className="font-semibold text-gray-800">{motorcycle.name}</span></p>
          <p className="text-sm text-gray-600">Giá xe: <span className="font-semibold text-gray-800">{formatCurrency(motorcycle.price)}</span></p>
        </div>

        <div className="mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
            <input
              type="text"
              value={form.fullName}
              onChange={handleChange("fullName")}
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="0912345678"
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CMND/CCCD *</label>
            <input
              type="text"
              value={form.idCardNumber}
              onChange={handleChange("idCardNumber")}
              placeholder="Nhập 9 hoặc 12 số"
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thu nhập hàng tháng *</label>
            <select
              value={form.monthlyIncome}
              onChange={handleChange("monthlyIncome")}
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Chọn mức thu nhập --</option>
              {MONTHLY_INCOME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền trả trước (VND) *</label>
              <input
                type="number"
                value={form.downPayment}
                onChange={handleChange("downPayment")}
                min={0}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tháng trả góp *</label>
              <select
                value={form.installmentMonths}
                onChange={handleChange("installmentMonths")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                {INSTALLMENT_MONTHS.map((m) => (
                  <option key={m} value={m}>{m} tháng</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
            <textarea
              value={form.customerNote}
              onChange={handleChange("customerNote")}
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Đang xử lý..." : "Gửi yêu cầu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallmentModal;
