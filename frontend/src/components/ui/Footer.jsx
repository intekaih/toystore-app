import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

/**
 * 🌸 Footer Component - Footer dễ thương với tone màu hồng sữa
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-primary-50 via-rose-50 to-cream-100 border-t-2 border-primary-100 mt-16">
      <div className="container-cute py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🧸</span>
              <h3 className="text-xl font-display font-bold text-gradient-primary">ToyStore</h3>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Cửa hàng đồ chơi dễ thương dành cho mọi lứa tuổi. 
              Chúng tôi mang đến niềm vui và hạnh phúc cho các bé!
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-white rounded-full text-primary-500 hover:bg-primary-500 hover:text-white transition-all shadow-soft hover:shadow-cute">
                <Facebook size={20} />
              </a>
              <a href="#" className="p-2 bg-white rounded-full text-primary-500 hover:bg-primary-500 hover:text-white transition-all shadow-soft hover:shadow-cute">
                <Instagram size={20} />
              </a>
              <a href="#" className="p-2 bg-white rounded-full text-primary-500 hover:bg-primary-500 hover:text-white transition-all shadow-soft hover:shadow-cute">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-gray-800 mb-4 text-lg">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary-500 transition-colors flex items-center gap-2">
                  <span className="text-primary-400">→</span> Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-600 hover:text-primary-500 transition-colors flex items-center gap-2">
                  <span className="text-primary-400">→</span> Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-600 hover:text-primary-500 transition-colors flex items-center gap-2">
                  <span className="text-primary-400">→</span> Giỏ hàng
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-600 hover:text-primary-500 transition-colors flex items-center gap-2">
                  <span className="text-primary-400">→</span> Đơn hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-display font-bold text-gray-800 mb-4 text-lg">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-500 transition-colors flex items-center gap-2">
                  <span className="text-primary-400">→</span> Chính sách đổi trả
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-500 transition-colors flex items-center gap-2">
                  <span className="text-primary-400">→</span> Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-500 transition-colors flex items-center gap-2">
                  <span className="text-primary-400">→</span> Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-500 transition-colors flex items-center gap-2">
                  <span className="text-primary-400">→</span> Điều khoản dịch vụ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-bold text-gray-800 mb-4 text-lg">Thông tin liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-600">
                <MapPin size={18} className="text-primary-500 mt-1 flex-shrink-0" />
                <span>123 Đường ABC, Quận XYZ, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <Phone size={18} className="text-primary-500 flex-shrink-0" />
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <Mail size={18} className="text-primary-500 flex-shrink-0" />
                <span>contact@toystore.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 pt-8 border-t-2 border-primary-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm text-center md:text-left">
              © {currentYear} ToyStore. All rights reserved.
            </p>
            <p className="flex items-center gap-2 text-gray-600 text-sm">
              Made with <Heart size={16} className="text-rose-500 fill-rose-500 animate-pulse" /> by ToyStore Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
