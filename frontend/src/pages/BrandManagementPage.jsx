import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, Check, Save, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import AdminLayout from '../layouts/AdminLayout';
import { Card, Button } from '../components/ui';
import Toast from '../components/Toast';

const BrandManagementPage = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ TenThuongHieu: '', Logo: '' });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

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
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setFormData({ TenThuongHieu: '', Logo: '' });
    setErrors({});
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
      if (modalMode === 'create') {
        const response = await adminService.createBrand(formData);
        if (response.success) {
          showToast('✅ Thêm thương hiệu thành công!', 'success');
          fetchBrands();
          handleCloseModal();
        }
      } else {
        const response = await adminService.updateBrand(editingBrand.id, formData);
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/admin/products')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center gap-2 text-gray-600 hover:text-gray-900"
              title="Quay lại trang quản lý sản phẩm"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Quay lại</span>
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Tag size={32} />
            Quản lý Thương hiệu
          </h2>
          <p className="text-gray-600 mt-1">Quản lý danh sách thương hiệu sản phẩm</p>
        </div>
        <div className="text-lg font-semibold text-gray-700">
          Tổng số thương hiệu: <span className="text-blue-600">{brands.length}</span>
        </div>
      </div>

      <div className="mb-6 flex justify-end">
        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-gradient-to-r from-pink-400 to-rose-400 
                   text-white font-semibold text-sm rounded-xl
                   hover:from-pink-500 hover:to-rose-500
                   transition-all duration-200 shadow-md hover:shadow-lg
                   flex items-center gap-2"
        >
          <Plus size={18} />
          Thêm thương hiệu
        </button>
      </div>

      {loading ? (
        <Card className="text-center p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </Card>
      ) : brands.length === 0 ? (
        <Card className="text-center bg-gradient-to-r from-gray-50 to-gray-100 p-12">
          <div className="flex flex-col items-center gap-4">
            <Tag size={64} className="opacity-50" />
            <p className="text-xl font-semibold text-gray-600">Chưa có thương hiệu nào</p>
            <Button onClick={handleOpenCreateModal}>
              <Plus size={16} className="mr-2" />
              Thêm thương hiệu đầu tiên
            </Button>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên thương hiệu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{brand.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{brand.tenThuongHieu}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {brand.logo ? <span className="text-blue-600">Có</span> : <span className="text-gray-400">Không</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        brand.trangThai ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {brand.trangThai ? '✅ Hoạt động' : '❌ Vô hiệu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(brand)}
                        className="text-blue-600 hover:text-blue-900 mr-4 inline-flex items-center gap-1"
                      >
                        <Edit size={16} />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Xóa
                      </button>
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
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="flex items-center gap-2">
                {modalMode === 'create' ? (
                  <>
                    <Plus size={18} />
                    Thêm thương hiệu mới
                  </>
                ) : (
                  <>
                    <Edit size={18} />
                    Cập nhật thương hiệu
                  </>
                )}
              </h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên thương hiệu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.TenThuongHieu}
                  onChange={(e) => setFormData({ ...formData, TenThuongHieu: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.TenThuongHieu ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nhập tên thương hiệu"
                />
                {errors.TenThuongHieu && (
                  <p className="text-red-500 text-sm mt-1">{errors.TenThuongHieu}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL (tùy chọn)</label>
                <input
                  type="text"
                  value={formData.Logo}
                  onChange={(e) => setFormData({ ...formData, Logo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                >
                  <X size={16} />
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-lg hover:from-pink-500 hover:to-rose-500 flex items-center gap-2"
                >
                  {modalMode === 'create' ? (
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