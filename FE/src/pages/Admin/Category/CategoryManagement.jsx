import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import categoryApi from "../../../api/categoryApi";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const CategoryManagement = () => {
  const [items, setItems] = useState([]);

  const load = () =>
    categoryApi.getAllAdmin().then((res) => setItems(res.data || []));

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Xoa dong xe "${name}"?`)) return;
    try {
      await categoryApi.delete(id);
      toast.success("Da xoa thanh cong");
      load();
    } catch (err) {
      toast.error(err.message || "Khong the xoa dong xe");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quan ly dong xe</h1>
        <Link
          to="/admin/categories/add"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Them dong xe
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Ten</th>
              <th className="px-4 py-3 text-center">So xe</th>
              <th className="px-4 py-3 text-center">Trang thai</th>
              <th className="px-4 py-3 text-center">Thao tac</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}
                    <span className="font-medium text-gray-800">
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-gray-500">
                  {item.motorcycleCount}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {item.active ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      to={`/admin/categories/edit/${item.id}`}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryManagement;
