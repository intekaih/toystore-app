import React, { useState, useEffect, useRef } from 'react';
import { Tag, Plus, Edit, Trash2, Check, Save, X, ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import AdminLayout from '../layouts/AdminLayout';
import { Card, Button } from '../components/ui';
import Toast from '../components/Toast';
import config from '../config';

const BrandManagementPage = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ TenThuongHieu: '', Logo: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await adminService.getBrands();
      if (response.success) {
        setBrands(response.data.brands || []);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      showToast('Lỗi khi tải danh sách thương hiệu!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingBrand(null);
    setFormData({ TenThuongHieu: '', Logo: '' });
    setLogoFile(null);
    setLogoPreview(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (brand) => {
    setModalMode('edit');
    setEditingBrand(brand);
    setFormData({ 
      TenThuongHieu: brand.tenThuongHieu || '', 
      Logo: brand.logo || '' 
    });
    setLogoFile(null);
    // Set preview từ logo hiện tại nếu có
    if (brand.logo) {
      const logoUrl = brand.logo.startsWith('http') 
        ? brand.logo 
        : `${config.API_URL.replace('/api', '')}${brand.logo}`;
      setLogoPreview(logoUrl);
    } else {
      setLogoPreview(null);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setFormData({ TenThuongHieu: '', Logo: '' });
    setLogoFile(null);
    setLogoPreview(null);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Vui lòng chọn file ảnh', 'error');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Kích thước file không được vượt quá 5MB', 'error');
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear Logo URL field khi upload file
      setFormData({ ...formData, Logo: '' });
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFormData({ ...formData, Logo: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.TenThuongHieu.trim()) {
      newErrors.TenThuongHieu = 'Tên thương hiệu là bắt buộc';
    } else if (formData.TenThuongHieu.trim().length < 2) {
      newErrors.TenThuongHieu = 'Tên thương hiệu phải có ít nhất 2 ký tự';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Tạo FormData để gửi file
      const submitData = new FormData();
      submitData.append('TenThuongHieu', formData.TenThuongHieu.trim());
      
      // Nếu có file upload, gửi file. Nếu không, gửi URL
      if (logoFile) {
        submitData.append('logo', logoFile);
      } else if (formData.Logo && formData.Logo.trim()) {
        submitData.append('Logo', formData.Logo.trim());
      }

      if (modalMode === 'create') {
        const response = await adminService.createBrand(submitData);
        if (response.success) {
          showToast('✅ Thêm thương hiệu thành công!', 'success');
          fetchBrands();
          handleCloseModal();
        }
      } else {
        const response = await adminService.updateBrand(editingBrand.id, submitData);
        if (response.success) {
          showToast('✅ Cập nhật thương hiệu thành công!', 'success');
          fetchBrands();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error submitting brand:', error);
      showToast(`❌ ${error.message}`, 'error');
    }
  };

  const handleDelete = async (brandId) => {
    if (!window.confirm('⚠️ Bạn có chắc chắn muốn xóa thương hiệu này?')) return;

    try {
      const response = await adminService.deleteBrand(brandId);
      if (response.success) {
        showToast('✅ Xóa thương hiệu thành công!', 'success');
        fetchBrands();
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      showToast(`❌ ${error.message}`, 'error');
    }
  };

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="mb-6">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Quay lại trang quản lý sản phẩm"
          >
            <ArrowLeft size={18} />
            <span>Quay lại</span>
          </button>
        </div>

        {/* Title and Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl">
                <Tag size={28} className="text-pink-600" />
              </div>
              Quản lý Thương hiệu
            </h1>
          
          </div>

          <div className="flex items-center">
            {/* Add Button */}
            <button
              onClick={handleOpenCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-pink-400 to-rose-400 
                       text-white font-semibold rounded-xl
                       hover:from-pink-500 hover:to-rose-500
                       transition-all duration-200 shadow-md hover:shadow-lg
                       flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} />
              <span>Thêm thương hiệu</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Card className="text-center p-16">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600"></div>
              <Tag size={24} className="absolute inset-0 m-auto text-pink-600" />
            </div>
            <p className="text-gray-600 font-medium">Đang tải danh sách thương hiệu...</p>
          </div>
        </Card>
      ) : brands.length === 0 ? (
        <Card className="text-center bg-gradient-to-br from-gray-50 via-pink-50 to-rose-50 p-16 border-2 border-dashed border-gray-300">
          <div className="flex flex-col items-center gap-6">
            <div className="p-6 bg-white rounded-full shadow-lg">
              <Tag size={64} className="text-gray-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Chưa có thương hiệu nào</h3>
              <p className="text-gray-600">Bắt đầu bằng cách thêm thương hiệu đầu tiên của bạn</p>
            </div>
            <Button 
              onClick={handleOpenCreateModal}
              variant="primary"
              size="lg"
              icon={<Plus size={20} />}
            >
              Thêm thương hiệu đầu tiên
            </Button>
          </div>
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    TÊN THƯƠNG HIỆU
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    LOGO
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    TRẠNG THÁI
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    THAO TÁC
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {brands.map((brand, index) => (
                  <tr 
                    key={brand.id} 
                    className={`hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">#{brand.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{brand.tenThuongHieu || brand.TenThuongHieu}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {brand.logo || brand.Logo ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Có
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Không
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        brand.trangThai !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {brand.trangThai !== false ? (
                          <>
                            <Check size={14} className="mr-1" />
                            Hoạt động
                          </>
                        ) : (
                          <>
                            <X size={14} className="mr-1" />
                            Vô hiệu
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleOpenEditModal(brand)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa thương hiệu"
                        >
                          <Edit size={16} />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa thương hiệu"
                        >
                          <Trash2 size={16} />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-100 bg-gradient-to-r from-pink-50 to-rose-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {modalMode === 'create' ? (
                  <>
                    <div className="p-2 bg-white rounded-lg">
                      <Plus size={20} className="text-pink-600" />
                    </div>
                    <span>Thêm thương hiệu mới</span>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-white rounded-lg">
                      <Edit size={20} className="text-pink-600" />
                    </div>
                    <span>Cập nhật thương hiệu</span>
                  </>
                )}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                title="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên thương hiệu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.TenThuongHieu}
                  onChange={(e) => setFormData({ ...formData, TenThuongHieu: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.TenThuongHieu 
                      ? 'border-red-400 focus:ring-red-200 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-pink-200 focus:border-pink-500'
                  }`}
                  placeholder="Nhập tên thương hiệu (ví dụ: Barbie, LEGO...)"
                  autoFocus
                />
                {errors.TenThuongHieu && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                    <X size={14} />
                    {errors.TenThuongHieu}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Logo thương hiệu <span className="text-gray-400 text-xs">(tùy chọn)</span>
                </label>
                
                {/* Preview ảnh */}
                {logoPreview && (
                  <div className="mb-4 relative inline-block">
                    <div className="relative w-32 h-32 border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        title="Xóa logo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload File */}
                {!logoPreview && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload size={32} className="text-gray-400 mb-2" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click để upload</span> hoặc kéo thả
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF tối đa 5MB
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Hoặc nhập URL (chỉ hiển thị khi không có preview) */}
                {!logoPreview && (
                  <div className="mt-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Hoặc</span>
                      </div>
                    </div>
                    <input
                      type="url"
                      value={formData.Logo}
                      onChange={(e) => setFormData({ ...formData, Logo: e.target.value })}
                      className="w-full px-4 py-3 mt-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500 transition-all"
                      placeholder="https://example.com/logo.png"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Nhập đường dẫn URL đến hình ảnh logo của thương hiệu
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <X size={16} />
                  <span>Hủy</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-400 to-rose-400 text-white font-semibold rounded-xl hover:from-pink-500 hover:to-rose-500 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  {modalMode === 'create' ? (
                    <>
                      <Check size={16} />
                      <span>Tạo mới</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Cập nhật</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}
    </AdminLayout>
  );
};

export default BrandManagementPage;