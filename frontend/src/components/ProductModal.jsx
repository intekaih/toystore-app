// src/components/ProductModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, FileText, Tag, FolderOpen, Camera, Folder, Check, Save, Loader, X } from 'lucide-react';
import config from '../config';
import adminService from '../services/adminService';
import AutocompleteInput from './AutocompleteInput';
import '../styles/ProductModal.css';

const ProductModal = ({ isOpen, onClose, onSubmit, editingProduct, categories, brands, mode, onRefreshData }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ten: '',
    moTa: '',
    giaBan: '',
    soLuongTon: '',
    loaiID: '',
    thuongHieuID: '',
    enable: true
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const [categoryData, setCategoryData] = useState({ id: null, ten: '' });
  const [brandData, setBrandData] = useState({ id: null, tenThuongHieu: '' });
  const [newCategories, setNewCategories] = useState([]);
  const [newBrands, setNewBrands] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && editingProduct) {
        console.log('📝 Loading product for edit:', editingProduct);
        
        // ✅ Normalize dữ liệu - hỗ trợ nhiều format
        const stock = editingProduct.soLuongTon !== undefined ? editingProduct.soLuongTon :
                     editingProduct.SoLuongTon !== undefined ? editingProduct.SoLuongTon :
                     editingProduct.Ton !== undefined ? editingProduct.Ton :
                     editingProduct.ton !== undefined ? editingProduct.ton : '';
        
        // ✅ Lấy loaiID từ nhiều format
        const loaiID = editingProduct.loaiID || 
                       editingProduct.LoaiID || 
                       editingProduct.loaiId || 
                       editingProduct.IDLoai || 
                       editingProduct.idLoai ||
                       (editingProduct.loaiSP?.id || editingProduct.loaiSP?.ID) ||
                       '';
        
        // ✅ Lấy thuongHieuID từ nhiều format
        const thuongHieuID = editingProduct.thuongHieuID || 
                             editingProduct.ThuongHieuID || 
                             editingProduct.thuongHieuId ||
                             editingProduct.IDThuongHieu ||
                             editingProduct.idThuongHieu ||
                             (editingProduct.thuongHieu?.id || editingProduct.thuongHieu?.ID) ||
                             '';
        
        // ✅ Lấy enable/trangThai
        const enable = editingProduct.enable !== undefined ? editingProduct.enable :
                      editingProduct.Enable !== undefined ? editingProduct.Enable :
                      editingProduct.trangThai !== undefined ? (editingProduct.trangThai === 1 || editingProduct.trangThai === true) :
                      editingProduct.TrangThai !== undefined ? (editingProduct.TrangThai === 1 || editingProduct.TrangThai === true) :
                      true;
        
        console.log('📝 Extracted IDs - loaiID:', loaiID, 'thuongHieuID:', thuongHieuID);
        
        setFormData({
          ten: editingProduct.ten || editingProduct.Ten || '',
          moTa: editingProduct.moTa || editingProduct.MoTa || '',
          giaBan: editingProduct.giaBan || editingProduct.GiaBan || '',
          soLuongTon: stock,
          loaiID: loaiID,
          thuongHieuID: thuongHieuID,
          enable: enable
        });

        // ✅ Tìm category với nhiều cách so sánh
        const category = categories.find(c => 
          c.id === loaiID || 
          c.ID === loaiID ||
          c.id === parseInt(loaiID) ||
          c.ID === parseInt(loaiID)
        );
        
        if (category) {
          console.log('✅ Found category:', category);
          setCategoryData({ id: category.id || category.ID, ten: category.ten || category.Ten });
        } else {
          console.warn('⚠️ Category not found for loaiID:', loaiID, 'Available categories:', categories);
        }

        // ✅ Tìm brand với nhiều cách so sánh
        const brand = brands.find(b => 
          b.id === thuongHieuID || 
          b.ID === thuongHieuID ||
          b.id === parseInt(thuongHieuID) ||
          b.ID === parseInt(thuongHieuID)
        );
        
        if (brand) {
          console.log('✅ Found brand:', brand);
          setBrandData({ 
            id: brand.id || brand.ID, 
            tenThuongHieu: brand.tenThuongHieu || brand.TenThuongHieu 
          });
        } else {
          console.warn('⚠️ Brand not found for thuongHieuID:', thuongHieuID, 'Available brands:', brands);
        }

        // ✅ Load hình ảnh - hỗ trợ nhiều format
        const hinhAnhURL = editingProduct.hinhAnhURL || editingProduct.HinhAnhURL;
        const hinhAnhs = editingProduct.hinhAnhs || editingProduct.HinhAnhs || [];
        
        if (hinhAnhs && Array.isArray(hinhAnhs) && hinhAnhs.length > 0) {
          // Nếu có mảng hinhAnhs, lấy từ đó
          const imageUrls = hinhAnhs
            .sort((a, b) => (a.thuTu || a.ThuTu || 0) - (b.thuTu || b.ThuTu || 0))
            .map(img => {
              const url = img.duongDanHinhAnh || img.DuongDanHinhAnh || '';
              return url.startsWith('http') ? url : config.getImageUrl(url);
            });
          setImagePreviews(imageUrls);
          console.log('✅ Loaded images from hinhAnhs:', imageUrls.length);
        } else if (hinhAnhURL) {
          try {
            // Thử parse JSON nếu là string JSON
            const urls = JSON.parse(hinhAnhURL);
            if (Array.isArray(urls)) {
              setImagePreviews(urls.map(url => {
                const fullUrl = url.startsWith('http') ? url : config.getImageUrl(url);
                return fullUrl;
              }));
            } else {
              const fullUrl = hinhAnhURL.startsWith('http') ? hinhAnhURL : config.getImageUrl(hinhAnhURL);
              setImagePreviews([fullUrl]);
            }
          } catch {
            // Nếu không phải JSON, dùng trực tiếp
            const fullUrl = hinhAnhURL.startsWith('http') ? hinhAnhURL : config.getImageUrl(hinhAnhURL);
            setImagePreviews([fullUrl]);
          }
          console.log('✅ Loaded image from hinhAnhURL');
        } else {
          setImagePreviews([]);
          console.warn('⚠️ No images found for product');
        }
      } else {
        setFormData({
          ten: '',
          moTa: '',
          giaBan: '',
          soLuongTon: '',
          loaiID: '',
          thuongHieuID: '',
          enable: true
        });
        setCategoryData({ id: null, ten: '' });
        setBrandData({ id: null, tenThuongHieu: '' });
        setImagePreviews([]);
      }
      setImageFiles([]);
      setErrors({});
      setNewCategories([]);
      setNewBrands([]);
    }
  }, [isOpen, mode, editingProduct, categories, brands]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxImages = 5;

    if (imageFiles.length + files.length > maxImages) {
      setErrors(prev => ({
        ...prev,
        hinhAnh: `Tối đa ${maxImages} ảnh`
      }));
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          hinhAnh: 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)'
        }));
        continue;
      }

      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          hinhAnh: 'Kích thước ảnh không được vượt quá 10MB'
        }));
        continue;
      }

      validFiles.push(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === validFiles.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    setImageFiles(prev => [...prev, ...validFiles]);

    if (errors.hinhAnh && validFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        hinhAnh: ''
      }));
    }
  };

  const handleRemoveImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const searchCategories = async (query) => {
    try {
      const response = await adminService.searchCategories(query);
      if (response.success) {
        return response.data.categories || [];
      }
      return [];
    } catch (error) {
      console.error('❌ Lỗi tìm kiếm danh mục:', error);
      return [];
    }
  };

  const searchBrands = async (query) => {
    try {
      const response = await adminService.searchBrands(query);
      if (response.success) {
        return response.data.brands || [];
      }
      return [];
    } catch (error) {
      console.error('❌ Lỗi tìm kiếm thương hiệu:', error);
      return [];
    }
  };

  const handleCategorySelect = (item) => {
    if (item.isNew) {
      setCategoryData({ id: null, ten: item.ten, isNew: true });
      setFormData(prev => ({ ...prev, loaiID: '' }));
      setNewCategories([...newCategories, item.ten]);
    } else {
      setCategoryData({ id: item.id, ten: item.ten });
      setFormData(prev => ({ ...prev, loaiID: item.id }));
    }
    
    if (errors.loaiID) {
      setErrors(prev => ({ ...prev, loaiID: '' }));
    }
  };

  const handleBrandSelect = (item) => {
    if (item.isNew) {
      setBrandData({ id: null, tenThuongHieu: item.tenThuongHieu, isNew: true });
      setFormData(prev => ({ ...prev, thuongHieuID: '' }));
      setNewBrands([...newBrands, item.tenThuongHieu]);
    } else {
      setBrandData({ id: item.id, tenThuongHieu: item.tenThuongHieu });
      setFormData(prev => ({ ...prev, thuongHieuID: item.id }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ten.trim()) {
      newErrors.ten = 'Tên sản phẩm là bắt buộc';
    } else if (formData.ten.trim().length < 3) {
      newErrors.ten = 'Tên sản phẩm phải có ít nhất 3 ký tự';
    } else if (formData.ten.trim().length > 200) {
      newErrors.ten = 'Tên sản phẩm không được vượt quá 200 ký tự';
    }

    if (!formData.giaBan) {
      newErrors.giaBan = 'Giá bán là bắt buộc';
    } else if (isNaN(formData.giaBan) || parseFloat(formData.giaBan) < 0) {
      newErrors.giaBan = 'Giá bán phải là số dương';
    } else if (parseFloat(formData.giaBan) > 1000000000) {
      newErrors.giaBan = 'Giá bán không hợp lệ';
    }

    if (!formData.soLuongTon && formData.soLuongTon !== 0) {
      newErrors.soLuongTon = 'Tồn kho là bắt buộc';
    } else if (isNaN(formData.soLuongTon) || parseInt(formData.soLuongTon) < 0) {
      newErrors.soLuongTon = 'Tồn kho phải là số không âm';
    } else if (!Number.isInteger(parseFloat(formData.soLuongTon))) {
      newErrors.soLuongTon = 'Tồn kho phải là số nguyên';
    }

    if (!formData.loaiID && !categoryData.isNew) {
      newErrors.loaiID = 'Vui lòng chọn hoặc nhập danh mục';
    }

    if (mode === 'create' && imageFiles.length === 0) {
      newErrors.hinhAnh = 'Vui lòng chọn ít nhất 1 ảnh sản phẩm';
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
      let categoryId = formData.loaiID;
      let brandId = formData.thuongHieuID;

      if (categoryData.isNew && categoryData.ten) {
        const catResponse = await adminService.createCategory({ Ten: categoryData.ten });
        if (catResponse.success) {
          categoryId = catResponse.data.category.id;
          if (onRefreshData) onRefreshData();
        }
      }

      if (brandData.isNew && brandData.tenThuongHieu) {
        const brandResponse = await adminService.createBrand({ TenThuongHieu: brandData.tenThuongHieu });
        if (brandResponse.success) {
          brandId = brandResponse.data.brand.id;
          if (onRefreshData) onRefreshData();
        }
      }

      const submitData = new FormData();
      submitData.append('Ten', formData.ten.trim());
      submitData.append('MoTa', formData.moTa.trim() || '');
      submitData.append('GiaBan', parseFloat(formData.giaBan));
      submitData.append('Ton', parseInt(formData.soLuongTon));
      submitData.append('LoaiID', parseInt(categoryId));
      if (brandId) {
        submitData.append('ThuongHieuID', parseInt(brandId));
      }
      submitData.append('Enable', formData.enable ? 'true' : 'false');

      imageFiles.forEach((file, index) => {
        submitData.append('hinhAnh', file);
      });

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigateToCategories = () => {
    navigate('/admin/categories');
    onClose();
  };

  const handleNavigateToBrands = () => {
    navigate('/admin/brands');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content product-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="flex items-center gap-2">
            {mode === 'create' ? (
              <>
                <Plus size={18} />
                Thêm sản phẩm mới
              </>
            ) : (
              <>
                <Edit size={18} />
                Cập nhật sản phẩm
              </>
            )}
          </h2>
          <button className="close-btn" onClick={onClose} disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form-wide">
          <div className="form-body-grid">
            <div className="form-column">
              <h3 className="column-title flex items-center gap-2">
                <FileText size={16} />
                Thông tin cơ bản
              </h3>
              
              <div className="form-group-compact">
                <label htmlFor="ten">Tên sản phẩm <span className="required">*</span></label>
                <input
                  type="text"
                  id="ten"
                  name="ten"
                  value={formData.ten}
                  onChange={handleChange}
                  className={errors.ten ? 'error' : ''}
                  disabled={isSubmitting}
                  placeholder="Nhập tên sản phẩm"
                  maxLength={200}
                />
                {errors.ten && <span className="error-message">{errors.ten}</span>}
              </div>

              <div className="form-row-compact">
                <div className="form-group-compact">
                  <label htmlFor="giaBan">Giá bán (VNĐ) <span className="required">*</span></label>
                  <input
                    type="number"
                    id="giaBan"
                    name="giaBan"
                    value={formData.giaBan}
                    onChange={handleChange}
                    className={errors.giaBan ? 'error' : ''}
                    disabled={isSubmitting}
                    placeholder="150000"
                    min="0"
                    step="1000"
                  />
                  {errors.giaBan && <span className="error-message">{errors.giaBan}</span>}
                </div>

                <div className="form-group-compact">
                  <label htmlFor="soLuongTon">Tồn kho <span className="required">*</span></label>
                  <input
                    type="number"
                    id="soLuongTon"
                    name="soLuongTon"
                    value={formData.soLuongTon}
                    onChange={handleChange}
                    className={errors.soLuongTon ? 'error' : ''}
                    disabled={isSubmitting}
                    placeholder="100"
                    min="0"
                    step="1"
                  />
                  {errors.soLuongTon && <span className="error-message">{errors.soLuongTon}</span>}
                </div>
              </div>

              <div className="form-group-compact">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="enable"
                    checked={formData.enable}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <span>Hiển thị sản phẩm</span>
                </label>
              </div>
            </div>

            <div className="form-column">
              <h3 className="column-title flex items-center gap-2">
                <Tag size={16} />
                Phân loại & Thương hiệu
              </h3>

              <div className="form-group-compact">
                <div className="flex items-center justify-between mb-2">
                  <label>Danh mục <span className="required">*</span></label>
                  <button
                    type="button"
                    onClick={handleNavigateToCategories}
                    className="btn-navigate-sm"
                    title="Quản lý danh mục"
                  >
                    <FolderOpen size={16} />
                  </button>
                </div>
                <AutocompleteInput
                  value={categoryData}
                  onSelect={handleCategorySelect}
                  searchFunction={searchCategories}
                  placeholder="Nhập hoặc chọn..."
                  required
                  error={errors.loaiID}
                  disabled={isSubmitting}
                  displayKey="ten"
                  valueKey="id"
                  createText="Tạo mới"
                />
              </div>

              <div className="form-group-compact">
                <div className="flex items-center justify-between mb-2">
                  <label>Thương hiệu</label>
                  <button
                    type="button"
                    onClick={handleNavigateToBrands}
                    className="btn-navigate-sm"
                    title="Quản lý thương hiệu"
                  >
                    <Tag size={16} />
                  </button>
                </div>
                <AutocompleteInput
                  value={brandData}
                  onSelect={handleBrandSelect}
                  searchFunction={searchBrands}
                  placeholder="Nhập hoặc chọn..."
                  disabled={isSubmitting}
                  displayKey="tenThuongHieu"
                  valueKey="id"
                  createText="Tạo mới"
                />
              </div>

              <div className="form-group-compact">
                <label htmlFor="moTa">Mô tả sản phẩm</label>
                <textarea
                  id="moTa"
                  name="moTa"
                  value={formData.moTa}
                  onChange={handleChange}
                  className={errors.moTa ? 'error' : ''}
                  disabled={isSubmitting}
                  placeholder="Nhập mô tả..."
                  rows={4}
                  maxLength={1000}
                />
                {errors.moTa && <span className="error-message">{errors.moTa}</span>}
              </div>
            </div>

            <div className="form-column">
              <h3 className="column-title flex items-center gap-2">
                <Camera size={16} />
                Hình ảnh (Tối đa 5)
              </h3>

              <div className="form-group-compact">
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
                    💡 <span>Ảnh đầu tiên bạn chọn sẽ là <strong>ảnh chính</strong> hiển thị trên danh sách sản phẩm</span>
                  </p>
                </div>

                <input
                  type="file"
                  id="hinhAnh"
                  name="hinhAnh"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  disabled={isSubmitting}
                  multiple
                  style={{ display: 'none' }}
                />

                <button
                  type="button"
                  className="btn-upload-compact flex items-center justify-center gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting || imagePreviews.length >= 5}
                >
                  <Folder size={16} />
                  Chọn ảnh ({imagePreviews.length}/5)
                </button>
                {errors.hinhAnh && <span className="error-message">{errors.hinhAnh}</span>}
              </div>

              <div className="image-grid-compact">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-item-compact relative">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    {index === 0 && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        Ảnh chính
                      </div>
                    )}
                    <button
                      type="button"
                      className="btn-remove-compact"
                      onClick={() => handleRemoveImage(index)}
                      disabled={isSubmitting}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
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

export default ProductModal;
