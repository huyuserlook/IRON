import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import motorcycleApi from "../../../api/motorcycleApi";
import brandApi from "../../../api/brandApi";
import categoryApi from "../../../api/categoryApi";
import toast from "react-hot-toast";
import { ChevronLeft, Save, ImagePlus, X, Plus, Trash2 } from "lucide-react";

const MAX_IMAGE_SIZE = 1200;
const IMAGE_QUALITY = 0.8;

/**
 * Đọc file ảnh, nén lại qua canvas (giảm kích thước) rồi trả về data-URL base64.
 */
const compressAndReadFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
          const scale = MAX_IMAGE_SIZE / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", IMAGE_QUALITY));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const MotorcycleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); // danh sách data-url của ảnh xe
  const [inventories, setInventories] = useState([]); // [{ colorName, colorCode, quantity }]
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    brandId: "",
    categoryId: "",
    price: "",
    costPrice: "",
    engineCc: "",
    horsepower: "",
    torque: "",
    yearModel: "",
    thumbnailUrl: "",
    stock: "",
    description: "",
    specifications: "",
    featured: false,
  });

  useEffect(() => {
    brandApi.getAllAdmin().then((res) => {
      const payload = res?.data ?? res;
      setBrands(payload || []);
    });
    categoryApi.getAllAdmin().then((res) => {
      const payload = res?.data ?? res;
      setCategories(payload || []);
    });
    if (isEdit) {
      motorcycleApi.getById(id).then((res) => {
        const payload = res?.data ?? res;
        const m = payload || {};
        void payload;
        setForm({
          name: m.name,
          brandId: m.brand?.id,
          categoryId: m.category?.id,
          price: m.price,
          costPrice: m.costPrice || "",
          engineCc: m.engineCc || "",
          horsepower: m.horsepower || "",
          torque: m.torque || "",
          yearModel: m.yearModel || "",
          thumbnailUrl: m.thumbnailUrl || "",
          stock: m.stock ?? 0,
          description: m.description || "",
          specifications: m.specifications || "",
          featured: m.featured,
        });
        // Load lại danh sách ảnh đã lưu
        const existingImages = (m.images || []).map((img) => img.imageUrl);
        if (existingImages.length) {
          setImages(existingImages);
        }
        // Load lại danh sách tồn kho đã lưu
        setInventories(
          (m.inventories || []).map((inv) => ({
            colorName: inv.colorName || "",
            colorCode: inv.colorCode || "",
            quantity: inv.quantity ?? 0,
          })),
        );
      });
    }
  }, [id, isEdit]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSelectImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (images.length + files.length > 10) {
      toast.error("Chỉ được tối đa 10 ảnh.");
      return;
    }
    setIsUploading(true);
    try {
      const compressed = [];
      for (const file of files) {
        const dataUrl = await compressAndReadFile(file);
        compressed.push(dataUrl);
      }
      setImages((prev) => [...prev, ...compressed]);
      toast.success(`Đã thêm ${compressed.length} ảnh.`);
    } catch {
      toast.error("Không thể đọc ảnh.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addInventoryRow = () => {
    setInventories((prev) => [
      ...prev,
      { colorName: "", colorCode: "", quantity: 0 },
    ]);
  };

  const updateInventoryRow = (index, key, value) => {
    setInventories((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );
  };

  const removeInventoryRow = (index) => {
    setInventories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { status, ...payload } = {
        ...form,
        price: Number(form.price),
        costPrice: form.costPrice ? Number(form.costPrice) : null,
        engineCc: form.engineCc ? Number(form.engineCc) : null,
        horsepower: form.horsepower ? Number(form.horsepower) : null,
        torque: form.torque ? Number(form.torque) : null,
        yearModel: form.yearModel ? Number(form.yearModel) : null,
        stock: form.stock ? Number(form.stock) : 0,
        images,
        inventories: inventories
          .filter((row) => row.colorName && row.colorName.trim())
          .map((row) => ({
            colorName: row.colorName.trim(),
            colorCode: row.colorCode.trim(),
            quantity: Number(row.quantity) || 0,
          })),
      };
      if (isEdit) {
        await motorcycleApi.update(id, payload);
        toast.success("Cập nhật xe thành công!");
      } else {
        await motorcycleApi.create(payload);
        toast.success("Thêm xe thành công!");
      }
      navigate("/admin/motorcycles");
    } catch (err) {
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-orange-500 transition-colors"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? "Chỉnh sửa xe" : "Thêm xe mới"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-6 space-y-5"
      >
        {/* Tên xe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên xe *
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Honda CB650R 2024"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* Hãng & Dòng */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hãng xe *
            </label>
            <select
              required
              value={form.brandId}
              onChange={(e) => set("brandId", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="">Chọn hãng xe</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dòng xe *
            </label>
            <select
              required
              value={form.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="">Chọn dòng xe</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Giá & Phân khối */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá bán (VNĐ) *
            </label>
            <input
              required
              type="number"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="350000000"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá vốn (VNĐ)
            </label>
            <input
              type="number"
              min="0"
              value={form.costPrice}
              onChange={(e) => set("costPrice", e.target.value)}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            {form.costPrice && Number(form.costPrice) > Number(form.price) && (
              <p className="mt-1 text-xs text-red-500">
                Giá vốn đang cao hơn giá bán, xe này sẽ lỗ
              </p>
            )}
          </div>
        </div>

        {/* Phân khối */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phân khối (cc)
            </label>
            <input
              type="number"
              value={form.engineCc}
              onChange={(e) => set("engineCc", e.target.value)}
              placeholder="650"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        </div>

        {/* HP, Torque, Year */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Công suất (HP)
            </label>
            <input
              type="number"
              step="0.1"
              value={form.horsepower}
              onChange={(e) => set("horsepower", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô-men (Nm)
            </label>
            <input
              type="number"
              step="0.1"
              value={form.torque}
              onChange={(e) => set("torque", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Năm sản xuất
            </label>
            <input
              type="number"
              value={form.yearModel}
              onChange={(e) => set("yearModel", e.target.value)}
              placeholder="2024"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        </div>

        {/* Upload nhiều ảnh */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hình ảnh xe (tối đa 10 ảnh)
          </label>
          <div className="flex flex-wrap gap-3">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200"
              >
                <img
                  src={img}
                  alt={`Ảnh ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                    Ảnh chính
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                  aria-label="Xóa ảnh"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {images.length < 10 && (
              <label className="w-24 h-24 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-400 cursor-pointer transition-colors">
                <ImagePlus size={20} />
                <span className="text-[10px] mt-1">
                  {isUploading ? "Đang xử lý..." : "Thêm ảnh"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSelectImages}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Ảnh đầu tiên sẽ được dùng làm ảnh đại diện. Ảnh sẽ được tự động nén
            để tải lên nhanh.
          </p>
        </div>

        {/* URL ảnh đại diện tùy chọn */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL ảnh đại diện (tùy chọn)
          </label>
          <input
            value={form.thumbnailUrl}
            onChange={(e) => set("thumbnailUrl", e.target.value)}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* Số lượng tồn kho */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số lượng tồn kho
          </label>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            placeholder="0"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <p className="mt-1 text-xs text-gray-400">
            Nhập tổng số xe hiện có. Khi hết hàng (0), trạng thái sẽ tự động chuyển thành &quot;Hết hàng&quot;.
          </p>
        </div>

        {/* Xe nổi bật */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="featured"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="w-4 h-4 accent-orange-500"
          />
          <label htmlFor="featured" className="text-sm font-medium text-gray-700">
            Xe nổi bật (hiển thị trang chủ)
          </label>
        </div>

        {/* Tồn kho theo màu */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Số lượng tồn kho theo màu
            </label>
            <button
              type="button"
              onClick={addInventoryRow}
              className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
            >
              <Plus size={16} /> Thêm màu
            </button>
          </div>

          {inventories.length === 0 ? (
            <div className="text-sm text-gray-400 border border-dashed border-gray-300 rounded-lg p-4 text-center">
              Chưa có màu nào. Nhấn "Thêm màu" để nhập tồn kho.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs font-medium text-gray-400 px-1">
                <span>Tên màu</span>
                <span>Mã màu</span>
                <span>Số lượng</span>
                <span />
              </div>
              {inventories.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2"
                >
                  <input
                    value={row.colorName}
                    onChange={(e) =>
                      updateInventoryRow(index, "colorName", e.target.value)
                    }
                    placeholder="Màu đỏ"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <input
                    value={row.colorCode}
                    onChange={(e) =>
                      updateInventoryRow(index, "colorCode", e.target.value)
                    }
                    placeholder="#FF0000"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <input
                    type="number"
                    min="0"
                    value={row.quantity}
                    onChange={(e) =>
                      updateInventoryRow(index, "quantity", e.target.value)
                    }
                    placeholder="0"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeInventoryRow(index)}
                    className="flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Xóa màu"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          />
        </div>

        {/* Trạng thái (tự động theo tồn kho) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái
          </label>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
              Number(form.stock) > 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {Number(form.stock) > 0 ? "Còn hàng" : "Hết hàng"}
          </span>
          <p className="mt-1 text-xs text-gray-400">
            Trạng thái được tính tự động theo số lượng tồn kho.
          </p>
        </div>

        {/* Mô tả */}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            <Save size={16} />{" "}
            {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm xe"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default MotorcycleForm;
