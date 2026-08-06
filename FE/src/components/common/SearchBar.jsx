import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import motorcycleApi from "../../api/motorcycleApi";
import { useDebounce } from "../../hooks/useDebounce";
import { formatCurrency } from "../../utils/formatCurrency";

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(
  /\/api\/?$/,
  "",
);

const resolveImageUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//.test(url) || url.startsWith("data:")) return url;
  return url.startsWith("/") ? `${API_ROOT}${url}` : `${API_ROOT}/${url}`;
};

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const debounced = useDebounce(query, 400);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = debounced.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    motorcycleApi
      .search({ keyword: q, page: 0, size: 8 })
      .then((res) => {
        const payload = res?.data ?? res;
        setResults(Array.isArray(payload) ? payload : payload?.content || []);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debounced]);

  const goToResults = () => {
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    navigate(`/motorcycles?keyword=${encodeURIComponent(q)}`);
  };

  const handleResultClick = (slug) => {
    navigate(`/motorcycles/${slug}`);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative hidden md:block w-full max-w-xs lg:max-w-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToResults();
        }}
        className="relative"
      >
        <Search
          size={14}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-200 peer-focus:scale-110 peer-focus:text-iron-red"
        />
         <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          placeholder="Tìm kiếm xe..."
          className="peer w-full rounded-full border border-gray-300 bg-white px-3 py-1.5 pl-8 text-xs text-gray-800 placeholder-gray-400 shadow-sm outline-none transition-colors focus:border-iron-red focus:ring-1 focus:ring-iron-red"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:text-gray-600"
            aria-label="Xóa"
          >
            <X size={12} />
          </button>
        ) : null}
      </form>

      <div
        className={`absolute top-full mt-1 w-full max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.15)] transition-all duration-200 ease-out ${
          open && query.trim()
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-5 text-xs text-gray-500">
            <Loader2 size={14} className="animate-spin text-iron-red" />
            Đang tìm kiếm...
          </div>
        ) : results.length > 0 ? (
          <>
            <ul className="py-1">
              {results.map((moto) => (
                <li
                  key={moto.id}
                  onClick={() => handleResultClick(moto.slug)}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 transition-all duration-200 hover:translate-x-1 hover:bg-gray-50"
                >
                    <div className="flex h-10 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">
                      {moto.thumbnailUrl ? (
                        <img
                          src={resolveImageUrl(moto.thumbnailUrl)}
                          alt={moto.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-gray-400">No img</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-gray-800">
                        {moto.name}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {moto.brandName}
                      </p>
                    </div>
                    <div className="text-right text-[10px] font-semibold text-iron-red">
                      {formatCurrency(moto.price)}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100 px-3 py-1.5 text-center">
                <button
                  type="button"
                  onClick={goToResults}
                  className="text-xs font-medium text-iron-red hover:underline"
                >
                  Xem tất cả kết quả
                </button>
              </div>
            </>
          ) : (
            <div className="py-5 text-center text-xs text-gray-500">
              Không tìm thấy xe nào
            </div>
          )}
      </div>
    </div>
  );
};

export default SearchBar;
