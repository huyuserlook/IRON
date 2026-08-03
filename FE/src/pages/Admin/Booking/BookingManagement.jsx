import { useCallback, useEffect, useState } from "react";
import bookingApi from "../../../api/bookingApi";
import { formatDate } from "../../../utils/formatDate";
import { BOOKING_STATUS } from "../../../utils/constants";
import toast from "react-hot-toast";

const BookingManagement = () => {
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);

  const load = useCallback(
    () =>
      bookingApi
        .getAllAdmin({ status: status || undefined, page, size: 10 })
        .then((res) => {
          const payload = res?.data ?? res;
          setData(payload || { content: [], totalPages: 0 });
        }),
    [page, status],
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (id, newStatus) => {
    try {
      await bookingApi.updateStatus(id, newStatus);
      toast.success("Đã cập nhật");
      load();
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  const STATUSES = ["", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Quản lý lịch lái thử
      </h1>
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex gap-3 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(0);
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
              ${status === s ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}
          >
            {s ? BOOKING_STATUS[s]?.label : "Tất cả"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Khách hàng</th>
              <th className="px-4 py-3 text-left">Xe</th>
              <th className="px-4 py-3 text-center">Ngày / Giờ</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center">Cập nhật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.content?.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{b.customerName}</p>
                  <p className="text-xs text-gray-400">{b.customerPhone}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-700">
                    {b.motorcycleName}
                  </p>
                  <p className="text-xs text-gray-400">{b.brandName}</p>
                </td>
                <td className="px-4 py-3 text-center text-gray-600">
                  <p>{formatDate(b.bookingDate)}</p>
                  <p className="text-xs text-gray-400">{b.bookingTime}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium bg-${BOOKING_STATUS[b.status]?.color}-100 text-${BOOKING_STATUS[b.status]?.color}-700`}
                  >
                    {BOOKING_STATUS[b.status]?.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <select
                    value={b.status}
                    onChange={(e) => handleStatus(b.id, e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
                  >
                    {STATUSES.filter(Boolean).map((s) => (
                      <option key={s} value={s}>
                        {BOOKING_STATUS[s]?.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingManagement;
