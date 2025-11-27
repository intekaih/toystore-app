// src/components/CategoryModal.js
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Check, Save, Loader, X } from 'lucide-react';
import '../styles/CategoryModal.css';

const CategoryModal = ({ isOpen, onClose, onSubmit, editingCategory, mode }) => {
  const [formData, setFormData] = useState({
    Ten: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form khi modal đóng/mở hoặc chuyển mode
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && editingCategory) {
        // ✅ Chỉ lấy Ten (bỏ MoTa)
        setFormData({
          Ten: editingCategory.Ten || editingCategory.ten || ''
        });
      } else {
        setFormData({
          Ten: ''
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
      // ✅ Chỉ gửi Ten (bỏ MoTa)
      const submitData = {
        Ten: formData.Ten.trim()
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
      <div className="modal-content category-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="flex items-center gap-2">
            {mode === 'create' ? (
              <>
                <div className="header-icon-box">
                  <Plus size={18} />
                </div>
                Thêm danh mục mới
              </>
            ) : (
              <>
                <div className="header-icon-box">
                  <Edit size={18} />
                </div>
                Cập nhật danh mục
              </>
            )}
          </h2>
          <button className="close-btn" onClick={onClose} disabled={isSubmitting}>
            <X size={20} />
          </button>
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
                placeholder="Nhập tên"
                maxLength={100}
                autoFocus
              />
              {errors.Ten && <span className="error-message">{errors.Ten}</span>}
            </div>

            {mode === 'edit' && editingCategory && (
              <div className="info-box">
                <span className="info-icon">ℹ️</span>
                <span>Danh mục này có <strong>{editingCategory.SoLuongSanPham || editingCategory.soLuongSanPham || 0} sản phẩm</strong></span>
              </div>
            )}
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

export default CategoryModal;
