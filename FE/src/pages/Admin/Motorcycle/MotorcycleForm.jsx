import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import motorcycleApi from "../../../api/motorcycleApi";
import brandApi from "../../../api/brandApi";
import categoryApi from "../../../api/categoryApi";
import toast from "react-hot-toast";
import { ChevronLeft, Save } from "lucide-react";

const MotorcycleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    brandId: "",
    categoryId: "",
    price: "",
    engineCc: "",
    horsepower: "",
    torque: "",
    yearModel: "",
    thumbnailUrl: "",
    description: "",
    specifications: "",
    status: "AVAILABLE",
    featured: false,
  });

  useEffect(() => {
    brandApi.getAllAdmin().then((res) => setBrands(res.data || []));
    categoryApi.getAllAdmin().then((res) => setCategories(res.data || []));
    if (isEdit) {
      motorcycleApi.getById(id).then((res) => {
        const m = res.data;
        setForm({
          name: m.name,
          brandId: m.brand?.id,
          categoryId: m.category?.id,
          price: m.price,
          engineCc: m.engineCc || "",
          horsepower: m.horsepower || "",
          torque: m.torque || "",
          yearModel: m.yearModel || "",
          thumbnailUrl: m.thumbnailUrl || "",
          description: m.description || "",
          specifications: m.specifications || "",
          status: m.status,
          featured: m.featured,
        });
      });
    }
  }, [id, isEdit]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await motorcycleApi.update(id, form);
        toast.success("Cập nhật xe thành công!");
      } else {
        await motorcycleApi.create(form);
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

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL ảnh đại diện
          </label>
          <input
            value={form.thumbnailUrl}
            onChange={(e) => set("thumbnailUrl", e.target.value)}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          {form.thumbnailUrl && (
            <img
              src={form.thumbnailUrl}
              alt="preview"
              className="mt-2 h-32 object-cover rounded-lg border"
            />
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

        {/* Status & Featured */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="AVAILABLE">Còn hàng</option>
              <option value="OUT_OF_STOCK">Hết hàng</option>
              <option value="COMING_SOON">Sắp ra mắt</option>
              <option value="DISCONTINUED">Ngừng sản xuất</option>
            </select>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="featured"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="w-4 h-4 accent-orange-500"
            />
            <label
              htmlFor="featured"
              className="text-sm font-medium text-gray-700"
            >
              Xe nổi bật (hiển thị trang chủ)
            </label>
          </div>
        </div>

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
