import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import categoryApi from "../../../api/categoryApi";
import toast from "react-hot-toast";
import { ChevronLeft, Save } from "lucide-react";

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    imageUrl: "",
    description: "",
    active: true,
  });

  useEffect(() => {
    if (isEdit) {
      categoryApi.getById(id).then((res) => {
        const data = res.data;
        setForm({
          name: data.name,
          imageUrl: data.imageUrl || "",
          description: data.description || "",
          active: data.active,
        });
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await categoryApi.update(id, form);
        toast.success("Cap nhat thanh cong");
      } else {
        await categoryApi.create(form);
        toast.success("Them thanh cong");
      }
      navigate("/admin/categories");
    } catch (err) {
      toast.error(err.message || "Co loi xay ra");
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
          {isEdit ? "Chinh sua" : "Them"} dong xe
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ten dong xe *
          </label>
          <input
            required
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL anh
          </label>
          <input
            value={form.imageUrl}
            onChange={(event) =>
              setForm({ ...form, imageUrl: event.target.value })
            }
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mo ta
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="category-active"
            checked={form.active}
            onChange={(event) =>
              setForm({ ...form, active: event.target.checked })
            }
            className="w-4 h-4 accent-orange-500"
          />
          <label
            htmlFor="category-active"
            className="text-sm font-medium text-gray-700"
          >
            Hien thi
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            <Save size={16} />{" "}
            {loading ? "Dang luu..." : isEdit ? "Cap nhat" : "Them moi"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
          >
            Huy
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
