import { useCallback, useEffect, useMemo, useState } from "react";
import { Star, Search, X, Trash2 } from "lucide-react";
import reviewApi from "../../../api/reviewApi";
import toast from "react-hot-toast";

const API_ROOT = (
  import.meta.env.VITE_API_URL || "http://localhost:8080/api"
).replace(/\/api\/?$/, "");

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

const statusOptions = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
];

const renderRatingStars = (rating) =>
  Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      size={14}
      className={index < rating ? "text-orange-500" : "text-gray-200"}
    />
  ));

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const loadReviews = useCallback(() => {
    setLoading(true);
    reviewApi
      .search({ keyword, status, page, size })
      .then((res) => {
        const payload = res?.data ?? res;
        setReviews(payload.content || []);
        setTotalPages(payload.totalPages || 0);
      })
      .catch(() => toast.error("Không thể tải danh sách đánh giá"))
      .finally(() => setLoading(false));
  }, [keyword, status, page, size]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return (
      reviews.reduce((sum, item) => sum + (item.rating || 0), 0) /
      reviews.length
    ).toFixed(1);
  }, [reviews]);

  const handleDelete = async (review) => {
    if (
      !window.confirm(
        `Xóa đánh giá của ${review.customerName || "khách hàng"}?`,
      )
    )
      return;
    setDeletingId(review.id);
    try {
      await reviewApi.delete(review.id);
      toast.success("Đã xóa đánh giá thành công");
      loadReviews();
    } catch (err) {
      toast.error(err?.message || "Không thể xóa đánh giá");
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
              Quản lý đánh giá khách hàng
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Xem toàn bộ đánh giá và điểm trung bình từ khách hàng đã mua xe.
            </p>
          </div>
          <div className="inline-flex items-center gap-4 rounded-3xl bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Điểm trung bình
            </div>
            <div className="flex items-center gap-2 text-3xl font-bold text-orange-600">
              {averageRating}
              <span className="flex items-center gap-1">
                {renderRatingStars(Math.round(averageRating))}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Danh sách đánh giá
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tổng {reviews.length} đánh giá đang hiển thị.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng hoặc xe..."
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
          ) : reviews.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              Không tìm thấy đánh giá nào.
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {review.status}
                      </span>
                      <p className="text-lg font-semibold text-slate-900">
                        {review.customerName}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500">
                      {review.customerEmail}
                    </p>
                    <p className="text-sm text-slate-600">
                      Xe:{" "}
                      <span className="font-semibold text-slate-900">
                        {review.motorcycleName}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <div className="inline-flex items-center gap-1">
                      {renderRatingStars(review.rating)}
                    </div>
                    <span>
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(review)}
                      disabled={deletingId === review.id}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                      title="Xóa đánh giá"
                    >
                      <Trash2 size={14} />
                      {deletingId === review.id ? "Đang xóa..." : "Xóa"}
                    </button>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-700">
                  {review.comment}
                </p>

                {review.imageUrl ? (
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImage(resolveImageUrl(review.imageUrl))
                    }
                    className="mt-4 block overflow-hidden rounded-xl border border-slate-200"
                    aria-label="Xem ảnh đánh giá"
                  >
                    <img
                      src={resolveImageUrl(review.imageUrl)}
                      alt="Ảnh đánh giá"
                      className="h-40 w-56 object-cover transition hover:opacity-90"
                    />
                  </button>
                ) : null}
              </div>
            ))
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

      {previewImage ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage("")}
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh đánh giá"
        >
          <button
            type="button"
            onClick={() => setPreviewImage("")}
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Đóng"
          >
            <X size={22} />
          </button>
          <img
            src={previewImage}
            alt="Ảnh đánh giá phóng to"
            className="max-h-[85vh] max-w-[92vw] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
};

export default ReviewManagement;
