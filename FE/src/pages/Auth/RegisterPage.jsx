import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const RegisterPage = () => {
  const { handleRegister, loading, error } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleRegister(form);
  };

  const fields = [
    {
      key: "fullName",
      label: "Họ và tên",
      type: "text",
      placeholder: "Nguyễn Văn A",
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      placeholder: "email@example.com",
    },
    {
      key: "password",
      label: "Mật khẩu",
      type: "password",
      placeholder: "••••••••",
    },
    {
      key: "phone",
      label: "Số điện thoại",
      type: "tel",
      placeholder: "0905xxxxxx",
    },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản</h2>
          <p className="text-gray-500">Đăng ký để trải nghiệm Iron Moto</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
              </label>
              <input
                type={type}
                required={key !== "phone"}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-8">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-orange-500 hover:text-orange-600 font-bold ml-1 transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
