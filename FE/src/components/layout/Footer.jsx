import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

const Footer = () => (
  <footer className="bg-gray-950 text-gray-400 pt-20 pb-10">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand Column */}
        <div className="space-y-6">
          <Link
            to="/"
            className="text-2xl font-black text-orange-500 tracking-tighter"
          >
            IRON MOTO
          </Link>
          <p className="text-sm leading-relaxed max-w-xs">
            Hệ thống Showroom mô tô phân khối lớn hàng đầu Việt Nam. Nơi hội tụ
            những thương hiệu xe danh tiếng thế giới và cộng đồng Rider chuyên
            nghiệp.
          </p>
          <div className="flex gap-4">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">
            Khám phá
          </h4>
          <ul className="space-y-4 text-sm">
            <li>
              <Link
                to="/motorcycles"
                className="hover:text-orange-500 transition-colors"
              >
                Bộ sưu tập xe
              </Link>
            </li>
            <li>
              <Link
                to="/booking"
                className="hover:text-orange-500 transition-colors"
              >
                Đăng ký lái thử
              </Link>
            </li>
            <li>
              <Link
                to="/motorcycles?featured=true"
                className="hover:text-orange-500 transition-colors"
              >
                Siêu phẩm nổi bật
              </Link>
            </li>
            <li>
              <Link
                to="/cart"
                className="hover:text-orange-500 transition-colors"
              >
                Giỏ hàng
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">
            Hỗ trợ
          </h4>
          <ul className="space-y-4 text-sm">
            <li>
              <Link
                to="/my-orders"
                className="hover:text-orange-500 transition-colors"
              >
                Theo dõi đơn hàng
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-orange-500 transition-colors">
                Chính sách bảo hành
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-orange-500 transition-colors">
                Dịch vụ sửa chữa
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-orange-500 transition-colors">
                Câu hỏi thường gặp
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">
            Liên hệ
          </h4>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin size={18} className="text-orange-500 shrink-0" />
              <span>123 Đường Nguyễn Huệ, TP. Huế, Việt Nam</span>
            </li>
            <li className="flex gap-3">
              <Phone size={18} className="text-orange-500 shrink-0" />
              <span>0905 123 456 (Zalo)</span>
            </li>
            <li className="flex gap-3">
              <Mail size={18} className="text-orange-500 shrink-0" />
              <span>ironmoto@showroom.vn</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <p>© 2024 Iron Moto Showroom. Tất cả các quyền được bảo lưu.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">
            Điều khoản sử dụng
          </a>
          <a href="#" className="hover:text-white">
            Chính sách bảo mật
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
