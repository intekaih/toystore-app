// src/components/UserModal.js
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Check, Save, Loader, X } from 'lucide-react';
import '../styles/UserModal.css';

const UserModal = ({ isOpen, onClose, onSubmit, editingUser, mode }) => {
  const [formData, setFormData] = useState({
    TenDangNhap: '',
    MatKhau: '',
    HoTen: '',
    Email: '',
    DienThoai: '',
    VaiTro: 'KhachHang'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form khi modal đóng/mở hoặc chuyển mode
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && editingUser) {
        setFormData({
          TenDangNhap: editingUser.tenDangNhap || '',
          MatKhau: '', // Không hiển thị mật khẩu cũ
          HoTen: editingUser.hoTen || '',
          Email: editingUser.email || '',
          DienThoai: editingUser.dienThoai || '',
          VaiTro: editingUser.vaiTro || 'KhachHang'
        });
      } else {
        setFormData({
          TenDangNhap: '',
          MatKhau: '',
          HoTen: '',
          Email: '',
          DienThoai: '',
          VaiTro: 'KhachHang'
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, editingUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Xóa lỗi khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate tên đăng nhập (chỉ khi tạo mới)
    if (mode === 'create') {
      if (!formData.TenDangNhap.trim()) {
        newErrors.TenDangNhap = 'Tên đăng nhập là bắt buộc';
      } else if (formData.TenDangNhap.length < 3 || formData.TenDangNhap.length > 50) {
        newErrors.TenDangNhap = 'Tên đăng nhập phải có từ 3 đến 50 ký tự';
      }

      // Validate mật khẩu (bắt buộc khi tạo mới)
      if (!formData.MatKhau) {
        newErrors.MatKhau = 'Mật khẩu là bắt buộc';
      } else if (formData.MatKhau.length < 6) {
        newErrors.MatKhau = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
    }

    // Validate họ tên
    if (!formData.HoTen.trim()) {
      newErrors.HoTen = 'Họ tên là bắt buộc';
    } else if (formData.HoTen.trim().length < 2) {
      newErrors.HoTen = 'Họ tên phải có ít nhất 2 ký tự';
    }

    // Validate email (nếu có)
    if (formData.Email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.Email)) {
        newErrors.Email = 'Định dạng email không hợp lệ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Chuẩn bị dữ liệu để gửi
      const submitData = {
        HoTen: formData.HoTen.trim(),
        Email: formData.Email.trim() || null,
        DienThoai: formData.DienThoai.trim() || null,
        VaiTro: formData.VaiTro
      };

      // Nếu tạo mới, thêm tên đăng nhập và mật khẩu
      if (mode === 'create') {
        submitData.TenDangNhap = formData.TenDangNhap.trim();
        submitData.MatKhau = formData.MatKhau;
      }

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      // Lỗi sẽ được xử lý ở component cha
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="flex items-center gap-2">
            {mode === 'create' ? (
              <>
                <Plus size={18} />
                Thêm người dùng mới
              </>
            ) : (
              <>
                <Edit size={18} />
                Cập nhật thông tin
              </>
            )}
          </h2>
          <button className="close-btn" onClick={onClose} disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-grid">
            {/* Tên đăng nhập - chỉ hiển thị khi tạo mới */}
            {mode === 'create' && (
              <div className="form-group">
                <label htmlFor="TenDangNhap">
                  Tên đăng nhập <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="TenDangNhap"
                  name="TenDangNhap"
                  value={formData.TenDangNhap}
                  onChange={handleChange}
                  className={errors.TenDangNhap ? 'error' : ''}
                  disabled={isSubmitting}
                  placeholder="Nhập tên đăng nhập"
                />
                {errors.TenDangNhap && <span className="error-message">{errors.TenDangNhap}</span>}
              </div>
            )}

            {/* Hiển thị tên đăng nhập khi edit (read-only) */}
            {mode === 'edit' && (
              <div className="form-group">
                <label>Tên đăng nhập</label>
                <input
                  type="text"
                  value={formData.TenDangNhap}
                  disabled
                  className="read-only"
                />
              </div>
            )}

            {/* Mật khẩu - chỉ bắt buộc khi tạo mới */}
            {mode === 'create' && (
              <div className="form-group">
                <label htmlFor="MatKhau">
                  Mật khẩu <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="MatKhau"
                  name="MatKhau"
                  value={formData.MatKhau}
                  onChange={handleChange}
                  className={errors.MatKhau ? 'error' : ''}
                  disabled={isSubmitting}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                />
                {errors.MatKhau && <span className="error-message">{errors.MatKhau}</span>}
              </div>
            )}

            {/* Họ tên */}
            <div className="form-group">
              <label htmlFor="HoTen">
                Họ và tên <span className="required">*</span>
              </label>
              <input
                type="text"
                id="HoTen"
                name="HoTen"
                value={formData.HoTen}
                onChange={handleChange}
                className={errors.HoTen ? 'error' : ''}
                disabled={isSubmitting}
                placeholder="Nhập họ và tên"
              />
              {errors.HoTen && <span className="error-message">{errors.HoTen}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="Email">Email</label>
              <input
                type="email"
                id="Email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                className={errors.Email ? 'error' : ''}
                disabled={isSubmitting}
                placeholder="Nhập email"
              />
              {errors.Email && <span className="error-message">{errors.Email}</span>}
            </div>

            {/* Điện thoại */}
            <div className="form-group">
              <label htmlFor="DienThoai">Số điện thoại</label>
              <input
                type="tel"
                id="DienThoai"
                name="DienThoai"
                value={formData.DienThoai}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Nhập số điện thoại"
              />
            </div>

            {/* Vai trò */}
            <div className="form-group">
              <label htmlFor="VaiTro">
                Vai trò <span className="required">*</span>
              </label>
              <select
                id="VaiTro"
                name="VaiTro"
                value={formData.VaiTro}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="KhachHang">Khách hàng</option>
                <option value="NhanVien">Nhân viên</option>
                <option value="Admin">Quản trị viên</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel flex items-center gap-2"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X size={16} />
              Hủy
            </button>
            <button
              type="submit"
              className="btn-submit flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  Đang xử lý...
                </>
              ) : mode === 'create' ? (
                <>
                  <Check size={16} />
                  Tạo mới
                </>
              ) : (
                <>
                  <Save size={16} />
                  Cập nhật
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
