// src/components/ProductModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../styles/ProductModal.css';

const ProductModal = ({ isOpen, onClose, onSubmit, editingProduct, categories, mode }) => {
  const [formData, setFormData] = useState({
    Ten: '',
    MoTa: '',
    GiaBan: '',
    Ton: '',
    LoaiID: '',
    Enable: true
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Reset form khi modal đóng/mở hoặc chuyển mode
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && editingProduct) {
        setFormData({
          Ten: editingProduct.ten || '',
          MoTa: editingProduct.moTa || '',
          GiaBan: editingProduct.giaBan || '',
          Ton: editingProduct.ton || '',
          LoaiID: editingProduct.loaiID || '', // Sửa từ loaiId thành loaiID
          Enable: editingProduct.enable !== undefined ? editingProduct.enable : true
        });
        
        // Set preview cho ảnh cũ - Sửa từ hinhAnh thành hinhAnhURL
        if (editingProduct.hinhAnhURL) {
          const imageUrl = editingProduct.hinhAnhURL.startsWith('http') 
            ? editingProduct.hinhAnhURL 
            : `http://localhost:5000${editingProduct.hinhAnhURL}`;
          setImagePreview(imageUrl);
        }
      } else {
        setFormData({
          Ten: '',
          MoTa: '',
          GiaBan: '',
          Ton: '',
          LoaiID: '',
          Enable: true
        });
        setImagePreview(null);
      }
      setImageFile(null);
      setErrors({});
    }
  }, [isOpen, mode, editingProduct]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Xóa lỗi khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Xử lý upload ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          hinhAnh: 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)'
        }));
        return;
      }
      
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          hinhAnh: 'Kích thước ảnh không được vượt quá 5MB'
        }));
        return;
      }
      
      setImageFile(file);
      
      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Xóa lỗi nếu có
      if (errors.hinhAnh) {
        setErrors(prev => ({
          ...prev,
          hinhAnh: ''
        }));
      }
    }
  };

  // Xóa ảnh
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate tên sản phẩm
    if (!formData.Ten.trim()) {
      newErrors.Ten = 'Tên sản phẩm là bắt buộc';
    } else if (formData.Ten.trim().length < 3) {
      newErrors.Ten = 'Tên sản phẩm phải có ít nhất 3 ký tự';
    } else if (formData.Ten.trim().length > 200) {
      newErrors.Ten = 'Tên sản phẩm không được vượt quá 200 ký tự';
    }

    // Validate giá bán
    if (!formData.GiaBan) {
      newErrors.GiaBan = 'Giá bán là bắt buộc';
    } else if (isNaN(formData.GiaBan) || parseFloat(formData.GiaBan) < 0) {
      newErrors.GiaBan = 'Giá bán phải là số dương';
    } else if (parseFloat(formData.GiaBan) > 1000000000) {
      newErrors.GiaBan = 'Giá bán không hợp lệ';
    }

    // Validate tồn kho
    if (!formData.Ton && formData.Ton !== 0) {
      newErrors.Ton = 'Tồn kho là bắt buộc';
    } else if (isNaN(formData.Ton) || parseInt(formData.Ton) < 0) {
      newErrors.Ton = 'Tồn kho phải là số không âm';
    } else if (!Number.isInteger(parseFloat(formData.Ton))) {
      newErrors.Ton = 'Tồn kho phải là số nguyên';
    }

    // Validate loại sản phẩm
    if (!formData.LoaiID) {
      newErrors.LoaiID = 'Vui lòng chọn loại sản phẩm';
    }

    // Validate ảnh (chỉ bắt buộc khi tạo mới)
    if (mode === 'create' && !imageFile) {
      newErrors.hinhAnh = 'Vui lòng chọn ảnh sản phẩm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Tạo FormData để gửi file
      const submitData = new FormData();
      submitData.append('Ten', formData.Ten.trim());
      submitData.append('MoTa', formData.MoTa.trim() || '');
      submitData.append('GiaBan', parseFloat(formData.GiaBan));
      submitData.append('Ton', parseInt(formData.Ton));
      submitData.append('LoaiID', parseInt(formData.LoaiID));
      submitData.append('Enable', formData.Enable ? 'true' : 'false');
      
      // Thêm file ảnh nếu có
      if (imageFile) {
        submitData.append('hinhAnh', imageFile);
      }

      // Debug: Log FormData content
      console.log('📤 Sending FormData:');
      for (let pair of submitData.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }

      await onSubmit(submitData);
      // onClose sẽ được gọi từ parent component sau khi submit thành công
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
      <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'create' ? '➕ Thêm sản phẩm mới' : '✏️ Cập nhật sản phẩm'}</h2>
          <button className="close-btn" onClick={onClose} disabled={isSubmitting}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-body">
            {/* Tên sản phẩm */}
            <div className="form-group">
              <label htmlFor="Ten">
                Tên sản phẩm <span className="required">*</span>
              </label>
              <input
                type="text"
                id="Ten"
                name="Ten"
                value={formData.Ten}
                onChange={handleChange}
                className={errors.Ten ? 'error' : ''}
                disabled={isSubmitting}
                placeholder="Nhập tên sản phẩm (VD: Búp bê Barbie)"
                maxLength={200}
              />
              {errors.Ten && <span className="error-message">{errors.Ten}</span>}
              <div className="char-count">{formData.Ten.length}/200 ký tự</div>
            </div>

            {/* Mô tả */}
            <div className="form-group">
              <label htmlFor="MoTa">Mô tả sản phẩm</label>
              <textarea
                id="MoTa"
                name="MoTa"
                value={formData.MoTa}
                onChange={handleChange}
                className={errors.MoTa ? 'error' : ''}
                disabled={isSubmitting}
                placeholder="Nhập mô tả chi tiết về sản phẩm..."
                rows={4}
                maxLength={1000}
              />
              {errors.MoTa && <span className="error-message">{errors.MoTa}</span>}
              <div className="char-count">{formData.MoTa.length}/1000 ký tự</div>
            </div>

            {/* Row: Giá bán và Tồn kho */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="GiaBan">
                  Giá bán (VNĐ) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="GiaBan"
                  name="GiaBan"
                  value={formData.GiaBan}
                  onChange={handleChange}
                  className={errors.GiaBan ? 'error' : ''}
                  disabled={isSubmitting}
                  placeholder="VD: 150000"
                  min="0"
                  step="1000"
                />
                {errors.GiaBan && <span className="error-message">{errors.GiaBan}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="Ton">
                  Tồn kho <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="Ton"
                  name="Ton"
                  value={formData.Ton}
                  onChange={handleChange}
                  className={errors.Ton ? 'error' : ''}
                  disabled={isSubmitting}
                  placeholder="VD: 100"
                  min="0"
                  step="1"
                />
                {errors.Ton && <span className="error-message">{errors.Ton}</span>}
              </div>
            </div>

            {/* Loại sản phẩm */}
            <div className="form-group">
              <label htmlFor="LoaiID">
                Loại sản phẩm <span className="required">*</span>
              </label>
              <select
                id="LoaiID"
                name="LoaiID"
                value={formData.LoaiID}
                onChange={handleChange}
                className={errors.LoaiID ? 'error' : ''}
                disabled={isSubmitting}
              >
                <option value="">-- Chọn loại sản phẩm --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.ten}
                  </option>
                ))}
              </select>
              {errors.LoaiID && <span className="error-message">{errors.LoaiID}</span>}
            </div>

            {/* Upload ảnh */}
            <div className="form-group">
              <label htmlFor="hinhAnh">
                Hình ảnh sản phẩm {mode === 'create' && <span className="required">*</span>}
              </label>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="hinhAnh"
                  name="hinhAnh"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  disabled={isSubmitting}
                  style={{ display: 'none' }}
                />
                
                {imagePreview ? (
                  <div className="image-preview-box">
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                    <button
                      type="button"
                      className="btn-remove-image"
                      onClick={handleRemoveImage}
                      disabled={isSubmitting}
                    >
                      ❌ Xóa ảnh
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-upload-image"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    📁 Chọn ảnh
                  </button>
                )}
              </div>
              {errors.hinhAnh && <span className="error-message">{errors.hinhAnh}</span>}
              <div className="image-hint">
                Định dạng: JPEG, PNG, GIF, WEBP. Kích thước tối đa: 5MB
              </div>
            </div>

            {/* Trạng thái */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="Enable"
                  checked={formData.Enable}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <span>Hiển thị sản phẩm (Enable)</span>
              </label>
            </div>

            {mode === 'edit' && editingProduct && (
              <div className="info-box">
                <span className="info-icon">ℹ️</span>
                <span>Sản phẩm ID: <strong>#{editingProduct.id}</strong></span>
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

export default ProductModal;
