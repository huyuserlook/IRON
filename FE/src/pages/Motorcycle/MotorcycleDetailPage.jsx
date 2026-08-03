import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import motorcycleApi from "../../api/motorcycleApi";
import { formatCurrency } from "../../utils/formatCurrency";
import { useCart } from "../../hooks/useCart";
import {
  ShoppingCart,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronLeft,
} from "lucide-react";
import toast from "react-hot-toast";

const MotorcycleDetailPage = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [moto, setMoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    setLoading(true);
    motorcycleApi
      .getBySlug(slug)
      .then((res) => {
        setMoto(res.data);
        setSelectedImg(res.data?.thumbnailUrl);
        if (res.data?.inventories?.length > 0)
          setSelectedColor(res.data.inventories[0]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!selectedColor) return toast.error("Vui lòng chọn màu xe");
    addItem({
      motorcycleId: moto.id,
      name: moto.name,
      price: moto.price,
      thumbnailUrl: moto.thumbnailUrl,
      colorName: selectedColor.colorName,
    });
    toast.success("Đã thêm vào giỏ hàng!");
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!moto)
    return (
      <div className="text-center py-20 text-gray-500">Không tìm thấy xe</div>
    );

  const statusMap = {
    AVAILABLE: { label: "Còn hàng", ok: true },
    OUT_OF_STOCK: { label: "Hết hàng", ok: false },
    COMING_SOON: { label: "Sắp ra mắt", ok: false },
  };
  const status = statusMap[moto.status] || { label: moto.status, ok: false };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        to="/motorcycles"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 mb-6"
      >
        <ChevronLeft size={16} /> Quay lại danh sách
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="bg-gray-100 rounded-2xl overflow-hidden h-80 mb-3">
            {selectedImg ? (
              <img
                src={selectedImg}
                alt={moto.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Chưa có ảnh
              </div>
            )}
          </div>
          {moto.images?.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[{ imageUrl: moto.thumbnailUrl }, ...moto.images].map(
                (img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(img.imageUrl)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${selectedImg === img.imageUrl ? "border-orange-400" : "border-transparent"}`}
                  >
                    <img
                      src={img.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-orange-500 font-medium text-sm mb-1">
            {moto.brand?.name} · {moto.category?.name}
          </p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{moto.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            {status.ok ? (
              <CheckCircle size={16} className="text-green-500" />
            ) : (
              <XCircle size={16} className="text-red-400" />
            )}
            <span
              className={`text-sm font-medium ${status.ok ? "text-green-600" : "text-red-500"}`}
            >
              {status.label}
            </span>
          </div>
          <p className="text-3xl font-extrabold text-orange-600 mb-5">
            {formatCurrency(moto.price)}
          </p>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              ["Phân khối", moto.engineCc ? `${moto.engineCc} cc` : "—"],
              ["Công suất", moto.horsepower ? `${moto.horsepower} HP` : "—"],
              ["Mô-men xoắn", moto.torque ? `${moto.torque} Nm` : "—"],
              ["Năm sản xuất", moto.yearModel || "—"],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="font-semibold text-gray-800 text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Color picker */}
          {moto.inventories?.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Chọn màu xe:
              </p>
              <div className="flex flex-wrap gap-2">
                {moto.inventories.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => setSelectedColor(inv)}
                    className={`px-4 py-1.5 rounded-full text-sm border transition-colors
                      ${selectedColor?.id === inv.id ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-300 hover:border-orange-300"}`}
                  >
                    {inv.colorName}
                    {inv.quantity <= 0 && (
                      <span className="ml-1 text-xs text-red-400">(hết)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleAddToCart}
              disabled={moto.status !== "AVAILABLE"}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              <ShoppingCart size={18} /> Thêm vào giỏ
            </button>
            <Link
              to={`/booking?motorcycleId=${moto.id}`}
              className="flex items-center gap-2 border-2 border-gray-800 hover:bg-gray-800 hover:text-white text-gray-800 font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Calendar size={18} /> Đặt lịch lái thử
            </Link>
          </div>
        </div>
      </div>

      {/* Description */}
      {moto.description && (
        <div className="mt-10 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-gray-800 mb-3">Mô tả</h2>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
            {moto.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default MotorcycleDetailPage;
