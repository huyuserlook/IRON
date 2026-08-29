import { useCallback, useEffect, useState } from "react";
import { Search, Trash2, Phone, Mail, User, MessageSquare } from "lucide-react";
import contactApi from "../../../api/contactApi";
import toast from "react-hot-toast";

const statusOptions = [
  { value: "", label: "Tất cả", color: "bg-gray-100 text-gray-600" },
  { value: "NEW", label: "Mới", color: "bg-blue-100 text-blue-700" },
  {
    value: "IN_PROGRESS",
    label: "Đang xử lý",
    color: "bg-amber-100 text-amber-700",
  },
  {
    value: "RESOLVED",
    label: "Đã xử lý",
    color: "bg-green-100 text-green-700",
  },
  { value: "SPAM", label: "Spam", color: "bg-red-100 text-red-700" },
];

const getStatusOption = (status) =>
  statusOptions.find((o) => o.value === status) || statusOptions[0];

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadContacts = useCallback(() => {
    setLoading(true);
    contactApi
      .search({ keyword, status, page, size })
      .then((res) => {
        const payload = res?.data ?? res;
        setContacts(payload.content || []);
        setTotalPages(payload.totalPages || 0);
        setTotalElements(payload.totalElements || 0);
      })
      .catch(() => toast.error("Không thể tải danh sách liên hệ"))
      .finally(() => setLoading(false));
  }, [keyword, status, page, size]);

  const loadNewCount = useCallback(() => {
    contactApi
      .getNewCount()
      .then((res) => {
        const payload = res?.data ?? res;
        setNewCount(Number(payload) || 0);
      })
      .catch(() => setNewCount(0));
  }, []);

  useEffect(() => {
    loadContacts();
    loadNewCount();
  }, [loadContacts, loadNewCount]);

  const handleStatusChange = async (contact, newStatus) => {
    if (newStatus === contact.status) return;
    setUpdatingId(contact.id);
    try {
      await contactApi.updateStatus(contact.id, newStatus);
      toast.success("Đã cập nhật trạng thái liên hệ");
      loadContacts();
      loadNewCount();
    } catch (err) {
      toast.error(err?.message || "Không thể cập nhật trạng thái");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (contact) => {
    if (!window.confirm(`Xóa liên hệ của ${contact.name}?`)) return;
    setDeletingId(contact.id);
    try {
      await contactApi.delete(contact.id);
      toast.success("Đã xóa liên hệ thành công");
      loadContacts();
      loadNewCount();
    } catch (err) {
      toast.error(err?.message || "Không thể xóa liên hệ");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-orange-500">
              Quản trị viên
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Quản lý liên hệ
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Theo dõi các yêu cầu liên hệ từ khách hàng gửi qua trang Liên hệ.
            </p>
          </div>
          <div className="inline-flex items-center gap-4 rounded-3xl bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Liên hệ mới
            </div>
            <div className="text-3xl font-bold text-blue-600">{newCount}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Danh sách liên hệ
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tổng {totalElements} liên hệ.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tên, email hoặc số điện thoại..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(0);
                }}
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-orange-300"
              />
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              className="rounded-full border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-700 outline-none focus:border-orange-300"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 rounded-3xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              Không tìm thấy liên hệ nào.
            </div>
          ) : (
            contacts.map((contact) => {
              const statusOption = getStatusOption(contact.status);
              return (
                <div
                  key={contact.id}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusOption.color}`}
                        >
                          {statusOption.label}
                        </span>
                        <p className="text-lg font-semibold text-slate-900">
                          {contact.name}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Phone size={14} className="text-slate-400" />
                          {contact.phone}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Mail size={14} className="text-slate-400" />
                          {contact.email}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <User size={14} className="text-slate-400" />
                          {new Date(contact.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                      {contact.message ? (
                        <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-slate-700">
                          <MessageSquare
                            size={15}
                            className="mt-1 shrink-0 text-slate-400"
                          />
                          <span>{contact.message}</span>
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={contact.status}
                        disabled={updatingId === contact.id}
                        onChange={(e) =>
                          handleStatusChange(contact, e.target.value)
                        }
                        className="rounded-full border border-slate-200 bg-white py-2 px-3 text-sm text-slate-700 outline-none focus:border-orange-300 disabled:opacity-50"
                      >
                        {statusOptions
                          .filter((o) => o.value !== "")
                          .map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDelete(contact)}
                        disabled={deletingId === contact.id}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                        title="Xóa liên hệ"
                      >
                        <Trash2 size={14} />
                        {deletingId === contact.id ? "Đang xóa..." : "Xóa"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setPage(index)}
                className={`min-w-[44px] rounded-full px-3 py-2 text-sm font-semibold transition ${
                  page === index
                    ? "bg-orange-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactManagement;
