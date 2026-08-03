import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import bookingApi from "../../api/bookingApi";
import motorcycleApi from "../../api/motorcycleApi";
import toast from "react-hot-toast";
import { Calendar } from "lucide-react";

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const motorcycleId = searchParams.get("motorcycleId");
  const [motorcycles, setMotorcycles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    motorcycleId: motorcycleId || "",
    bookingDate: "",
    bookingTime: "09:00",
    customerName: "",
    customerPhone: "",
    note: "",
  });

  useEffect(() => {
    motorcycleApi.getFeatured().then((res) => setMotorcycles(res.data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await bookingApi.create(form);
      toast.success(
        "Đặt lịch lái thử thành công! Chúng tôi sẽ liên hệ xác nhận.",
      );
      setForm({
        motorcycleId: "",
        bookingDate: "",
        bookingTime: "09:00",
        customerName: "",
        customerPhone: "",
        note: "",
      });
    } catch (err) {
      toast.error(err.message || "Đặt lịch thất bại");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 rounded-full mb-3">
          <Calendar size={28} className="text-orange-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Đặt lịch lái thử</h1>
        <p className="text-gray-500 text-sm mt-1">
          Trải nghiệm trực tiếp trước khi quyết định
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chọn xe lái thử *
          </label>
          <select
            required
            value={form.motorcycleId}
            onChange={(e) => setForm({ ...form, motorcycleId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option value="">— Chọn xe —</option>
            {motorcycles.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày lái thử *
            </label>
            <input
              required
              type="date"
              min={today}
              value={form.bookingDate}
              onChange={(e) =>
                setForm({ ...form, bookingDate: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giờ *
            </label>
            <select
              value={form.bookingTime}
              onChange={(e) =>
                setForm({ ...form, bookingTime: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              {[
                "08:00",
                "09:00",
                "10:00",
                "11:00",
                "14:00",
                "15:00",
                "16:00",
                "17:00",
              ].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Họ và tên *
          </label>
          <input
            required
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số điện thoại *
          </label>
          <input
            required
            type="tel"
            value={form.customerPhone}
            onChange={(e) =>
              setForm({ ...form, customerPhone: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú
          </label>
          <textarea
            rows={2}
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
        >
          {loading ? "Đang đặt lịch..." : "Xác nhận đặt lịch"}
        </button>
      </form>
    </div>
  );
};

export default BookingPage;
