import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import brandApi from "../../../api/brandApi";
import toast from "react-hot-toast";
import { ChevronLeft, Save } from "lucide-react";

const BrandForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    description: "",
    active: true,
  });

  useEffect(() => {
    if (isEdit) {
      brandApi.getById(id).then((res) => {
        const d = res.data;
        setForm({
          name: d.name,
          logoUrl: d.logoUrl || "",
          description: d.description || "",
          active: d.active,
        });
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await brandApi.update(id, form);
        toast.success("Cập nhật thành công!");
      } else {
        await brandApi.create(form);
        toast.success("Thêm thành công!");
      }
      navigate("/admin/brands");
    } catch (err) {
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-orange-500"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? "Chỉnh sửa" : "Thêm"} hãng xe
        </h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên hãng xe *
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL Logo
          </label>
          <input
            value={form.logoUrl}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="active"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="w-4 h-4 accent-orange-500"
          />
          <label htmlFor="active" className="text-sm font-medium text-gray-700">
            Hiển thị (active)
          </label>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            <Save size={16} />{" "}
            {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default BrandForm;
