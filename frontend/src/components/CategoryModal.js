// src/components/CategoryModal.js
import React, { useState, useEffect } from 'react';
import '../styles/CategoryModal.css';

const CategoryModal = ({ isOpen, onClose, onSubmit, editingCategory, mode }) => {
  const [formData, setFormData] = useState({
    Ten: '',
    MoTa: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form khi modal đóng/mở hoặc chuyển mode
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && editingCategory) {
        // ✅ Đọc PascalCase từ backend
        setFormData({
          Ten: editingCategory.Ten || '',
          MoTa: editingCategory.MoTa || ''
        });
      } else {
        setFormData({
          Ten: '',
          MoTa: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, editingCategory]);

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

    // Validate tên danh mục
    if (!formData.Ten.trim()) {
      newErrors.Ten = 'Tên danh mục là bắt buộc';
    } else if (formData.Ten.trim().length < 2) {
      newErrors.Ten = 'Tên danh mục phải có ít nhất 2 ký tự';
    } else if (formData.Ten.trim().length > 100) {
      newErrors.Ten = 'Tên danh mục không được vượt quá 100 ký tự';
    }

    // Validate mô tả (optional)
    if (formData.MoTa && formData.MoTa.length > 500) {
      newErrors.MoTa = 'Mô tả không được vượt quá 500 ký tự';
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
        Ten: formData.Ten.trim(),
        MoTa: formData.MoTa.trim() || null
      };

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
          <h2>{mode === 'create' ? '➕ Thêm danh mục mới' : '✏️ Cập nhật danh mục'}</h2>
          <button className="close-btn" onClick={onClose} disabled={isSubmitting}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-body">
            {/* Tên danh mục */}
            <div className="form-group">
              <label htmlFor="Ten">
                Tên danh mục <span className="required">*</span>
              </label>
              <input
                type="text"
                id="Ten"
                name="Ten"
                value={formData.Ten}
                onChange={handleChange}
                className={errors.Ten ? 'error' : ''}
                disabled={isSubmitting}
                placeholder="Nhập tên danh mục (VD: Đồ chơi xếp hình)"
                maxLength={100}
              />
              {errors.Ten && <span className="error-message">{errors.Ten}</span>}
              <div className="char-count">{formData.Ten.length}/100 ký tự</div>
            </div>

            {/* Mô tả */}
            <div className="form-group">
              <label htmlFor="MoTa">Mô tả</label>
              <textarea
                id="MoTa"
                name="MoTa"
                value={formData.MoTa}
                onChange={handleChange}
                className={errors.MoTa ? 'error' : ''}
                disabled={isSubmitting}
                placeholder="Nhập mô tả cho danh mục (không bắt buộc)"
                rows={4}
                maxLength={500}
              />
              {errors.MoTa && <span className="error-message">{errors.MoTa}</span>}
              <div className="char-count">{formData.MoTa.length}/500 ký tự</div>
            </div>

            {mode === 'edit' && editingCategory && (
              <div className="info-box">
                <span className="info-icon">ℹ️</span>
                <span>Danh mục này có <strong>{editingCategory.SoLuongSanPham || 0} sản phẩm</strong></span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              ❌ Hủy
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? '⏳ Đang xử lý...' : mode === 'create' ? '✅ Tạo mới' : '💾 Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
