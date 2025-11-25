// src/pages/VoucherManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Plus, Edit, Trash2, Check, Save, Loader, X, Play, Pause } from 'lucide-react';
import { voucherService } from '../services'; // ✅ Sử dụng voucherService
import Toast from '../components/Toast';
import Pagination from '../components/Pagination';
import { Button, Card, Switch } from '../components/ui';
import AdminLayout from '../layouts/AdminLayout';
import config from '../config';

const API_URL = config.API_URL;

const VoucherManagementPage = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingVoucher, setEditingVoucher] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      // ✅ Sử dụng voucherService thay vì axios trực tiếp
      const response = await voucherService.adminGetVouchers({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        trangThai: filterStatus
      });

      if (response.success) {
        setVouchers(response.data.vouchers || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.totalVouchers || 0);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      showToast('Lỗi khi tải danh sách voucher!', 'error');
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [currentPage, searchTerm, filterStatus]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingVoucher(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (voucher) => {
    setModalMode('edit');
    setEditingVoucher(voucher);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVoucher(null);
  };

  const handleSubmitVoucher = async (formData) => {
    try {
      if (modalMode === 'create') {
        // ✅ Sử dụng voucherService thay vì axios trực tiếp
        const response = await voucherService.adminCreateVoucher(formData);

        if (response.success) {
          showToast('✅ Thêm voucher thành công!', 'success');
          fetchVouchers();
          handleCloseModal();
        }
      } else {
        // ✅ Sử dụng voucherService thay vì axios trực tiếp
        const response = await voucherService.adminUpdateVoucher(
          editingVoucher.id,
          formData
        );

        if (response.success) {
          showToast('✅ Cập nhật voucher thành công!', 'success');
          fetchVouchers();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error submitting voucher:', error);
      const errorMsg = error.message || 'Có lỗi xảy ra!';
      showToast(`❌ ${errorMsg}`, 'error');
      throw error;
    }
  };

  const handleToggleStatus = async (voucher) => {
    const newStatus = voucher.trangThai === 'HoatDong' ? 'TamDung' : 'HoatDong';
    
    try {
      // ✅ Sử dụng voucherService thay vì axios trực tiếp
      const response = await voucherService.adminUpdateVoucherStatus(
        voucher.id,
        newStatus
      );

      if (response.success) {
        showToast(`✅ ${newStatus === 'HoatDong' ? 'Kích hoạt' : 'Tạm dừng'} voucher thành công!`, 'success');
        fetchVouchers();
      }
    } catch (error) {
      console.error('Error toggling voucher status:', error);
      showToast('❌ Không thể thay đổi trạng thái voucher!', 'error');
    }
  };

  const handleDeleteVoucher = async (voucherId) => {
    if (!window.confirm('⚠️ Bạn có chắc chắn muốn xóa voucher này?')) {
      return;
    }

    try {
      // ✅ Sử dụng voucherService thay vì axios trực tiếp
      const response = await voucherService.adminDeleteVoucher(voucherId);

      if (response.success) {
        showToast('✅ Xóa voucher thành công!', 'success');
        fetchVouchers();
      }
    } catch (error) {
      console.error('Error deleting voucher:', error);
      const errorMsg = error.message || 'Không thể xóa voucher!';
      showToast(`❌ ${errorMsg}`, 'error');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const badges = {
      HoatDong: { label: 'Hoạt động', class: 'bg-green-100 text-green-700' },
      TamDung: { label: 'Tạm dừng', class: 'bg-yellow-100 text-yellow-700' },
      HetHan: { label: 'Hết hạn', class: 'bg-red-100 text-red-700' }
    };
    const badge = badges[status] || badges.HetHan;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.class}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <AdminLayout>
      {/* Page Title */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Ticket size={32} />
            Quản lý Voucher
          </h2>
          <p className="text-gray-600 mt-1">Quản lý mã giảm giá cho khách hàng</p>
        </div>
        
        <div className="text-lg font-semibold text-gray-700">
          Tổng số voucher: <span className="text-purple-600">{totalItems}</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-2xl p-5 shadow-sm border border-purple-100">
        <div className="flex flex-wrap gap-3 items-stretch">
          {/* Dropdown: Trạng thái */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 bg-white border-2 border-purple-200 rounded-xl 
                     text-gray-700 font-medium text-sm
                     focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400
                     hover:border-purple-300 transition-all duration-200
                     w-[180px] cursor-pointer shadow-sm h-[42px]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="HoatDong">Hoạt động</option>
            <option value="TamDung">Tạm dừng</option>
            <option value="HetHan">Hết hạn</option>
          </select>

          {/* Thanh tìm kiếm */}
          <div className="flex-1 min-w-[280px]">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã hoặc tên voucher..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2.5 bg-white border-2 border-purple-200 rounded-xl 
                       text-gray-700 font-medium text-sm placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400
                       hover:border-purple-300 transition-all duration-200 shadow-sm h-[42px]"
            />
          </div>

          {/* Nút "Thêm" */}
          <button
            onClick={handleOpenCreateModal}
            className="px-5 bg-gradient-to-r from-purple-400 to-pink-400 
                     text-white font-semibold text-sm rounded-xl
                     hover:from-purple-500 hover:to-pink-500
                     focus:outline-none focus:ring-2 focus:ring-purple-300
                     transition-all duration-200 shadow-md hover:shadow-lg
                     flex items-center gap-2 whitespace-nowrap h-[42px]"
          >
            <Plus size={18} />
            Thêm voucher
          </button>
        </div>
      </div>

      {/* Voucher Table */}
      {loading ? (
        <Card className="text-center p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </Card>
      ) : vouchers.length === 0 ? (
        <Card className="text-center bg-gradient-to-r from-gray-50 to-gray-100 p-12">
          <div className="flex flex-col items-center gap-4">
            <Ticket size={64} className="opacity-50" />
            <p className="text-xl font-semibold text-gray-600">Không có voucher nào</p>
            <Button onClick={handleOpenCreateModal}>
              <Plus size={16} className="mr-2" />
              Thêm voucher đầu tiên
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card padding="none" className="mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-100">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Mã Voucher
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Tên
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Giảm giá
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Số lượng
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vouchers.map((voucher, index) => (
                    <tr key={voucher.id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-4 py-4">
                        <span className="font-bold text-purple-600">{voucher.maVoucher}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">{voucher.ten}</p>
                          {voucher.moTa && (
                            <p className="text-xs text-gray-500 mt-1">{voucher.moTa}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div>
                          <p className="font-bold text-green-600">
                            {voucher.loaiGiamGia === 'PhanTram' 
                              ? `${voucher.giaTriGiam}%` 
                              : formatCurrency(voucher.giaTriGiam)
                            }
                          </p>
                          {voucher.giamToiDa && (
                            <p className="text-xs text-gray-500">Tối đa: {formatCurrency(voucher.giamToiDa)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div>
                          <p className="font-semibold text-gray-700">
                            {voucher.soLuongConLai}/{voucher.soLuong || '∞'}
                          </p>
                          <p className="text-xs text-gray-500">Đã dùng: {voucher.soLuongDaSuDung}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-sm">
                        <div>
                          <p className="text-gray-700">{formatDate(voucher.ngayBatDau)}</p>
                          <p className="text-gray-500">đến</p>
                          <p className="text-gray-700">{formatDate(voucher.ngayKetThuc)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getStatusBadge(voucher.trangThai)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(voucher)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1
                              ${voucher.trangThai === 'HoatDong'
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            title={voucher.trangThai === 'HoatDong' ? 'Tạm dừng' : 'Kích hoạt'}
                          >
                            {voucher.trangThai === 'HoatDong' ? <Pause size={14} /> : <Play size={14} />}
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(voucher)}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 
                                     transition-all text-xs font-semibold flex items-center gap-1"
                            title="Chỉnh sửa"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteVoucher(voucher.id)}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 
                                     transition-all text-xs font-semibold flex items-center gap-1"
                            title="Xóa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}

      {/* Modal thêm/sửa */}
      {isModalOpen && (
        <VoucherModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitVoucher}
          editingVoucher={editingVoucher}
          mode={modalMode}
        />
      )}

      {/* Toast notification */}
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

// Voucher Modal Component
const VoucherModal = ({ isOpen, onClose, onSubmit, editingVoucher, mode }) => {
  const [formData, setFormData] = useState({
    maVoucher: '',
    ten: '',
    moTa: '',
    loaiGiamGia: 'PhanTram',
    giaTriGiam: '',
    giamToiDa: '',
    donHangToiThieu: '',
    ngayBatDau: '',
    ngayKetThuc: '',
    soLuong: '',
    suDungToiDaMoiNguoi: 1,
    apDungChoKhachVangLai: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && editingVoucher) {
        setFormData({
          maVoucher: editingVoucher.maVoucher || '',
          ten: editingVoucher.ten || '',
          moTa: editingVoucher.moTa || '',
          loaiGiamGia: editingVoucher.loaiGiamGia || 'PhanTram',
          giaTriGiam: editingVoucher.giaTriGiam || '',
          giamToiDa: editingVoucher.giamToiDa || '',
          donHangToiThieu: editingVoucher.donHangToiThieu || '',
          ngayBatDau: editingVoucher.ngayBatDau?.split('T')[0] || '',
          ngayKetThuc: editingVoucher.ngayKetThuc?.split('T')[0] || '',
          soLuong: editingVoucher.soLuong || '',
          suDungToiDaMoiNguoi: editingVoucher.suDungToiDaMoiNguoi || 1,
          apDungChoKhachVangLai: editingVoucher.apDungChoKhachVangLai !== false
        });
      } else {
        setFormData({
          maVoucher: '',
          ten: '',
          moTa: '',
          loaiGiamGia: 'PhanTram',
          giaTriGiam: '',
          giamToiDa: '',
          donHangToiThieu: '',
          ngayBatDau: '',
          ngayKetThuc: '',
          soLuong: '',
          suDungToiDaMoiNguoi: 1,
          apDungChoKhachVangLai: true
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, editingVoucher]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.maVoucher.trim()) newErrors.maVoucher = 'Mã voucher là bắt buộc';
    if (!formData.ten.trim()) newErrors.ten = 'Tên voucher là bắt buộc';
    if (!formData.giaTriGiam || formData.giaTriGiam <= 0) {
      newErrors.giaTriGiam = 'Giá trị giảm phải lớn hơn 0';
    }
    if (!formData.ngayBatDau) newErrors.ngayBatDau = 'Ngày bắt đầu là bắt buộc';
    if (!formData.ngayKetThuc) newErrors.ngayKetThuc = 'Ngày kết thúc là bắt buộc';
    
    if (formData.ngayBatDau && formData.ngayKetThuc) {
      if (new Date(formData.ngayBatDau) >= new Date(formData.ngayKetThuc)) {
        newErrors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const submitData = {
        maVoucher: formData.maVoucher.trim().toUpperCase(),
        ten: formData.ten.trim(),
        moTa: formData.moTa.trim() || null,
        loaiGiamGia: formData.loaiGiamGia,
        giaTriGiam: parseFloat(formData.giaTriGiam),
        giamToiDa: formData.giamToiDa ? parseFloat(formData.giamToiDa) : null,
        donHangToiThieu: formData.donHangToiThieu ? parseFloat(formData.donHangToiThieu) : 0,
        ngayBatDau: formData.ngayBatDau,
        ngayKetThuc: formData.ngayKetThuc,
        soLuong: formData.soLuong ? parseInt(formData.soLuong) : null,
        suDungToiDaMoiNguoi: parseInt(formData.suDungToiDaMoiNguoi),
        apDungChoKhachVangLai: formData.apDungChoKhachVangLai
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting voucher:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
         onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
           onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {mode === 'create' ? (
                <>
                  <Plus size={24} />
                  Thêm voucher mới
                </>
              ) : (
                <>
                  <Edit size={24} />
                  Cập nhật voucher
                </>
              )}
            </h2>
            <button onClick={onClose} className="text-white hover:text-gray-200" disabled={isSubmitting}>
              <X size={28} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mã Voucher */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mã Voucher <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="maVoucher"
                value={formData.maVoucher}
                onChange={handleChange}
                disabled={mode === 'edit' || isSubmitting}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none uppercase"
                placeholder="VD: SUMMER2025"
              />
              {errors.maVoucher && <span className="text-red-500 text-xs">{errors.maVoucher}</span>}
            </div>

            {/* Tên Voucher */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên Voucher <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ten"
                value={formData.ten}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                placeholder="VD: Giảm giá mùa hè"
              />
              {errors.ten && <span className="text-red-500 text-xs">{errors.ten}</span>}
            </div>

            {/* Loại giảm giá */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loại giảm giá <span className="text-red-500">*</span>
              </label>
              <select
                name="loaiGiamGia"
                value={formData.loaiGiamGia}
                onChange={handleChange}
                disabled={mode === 'edit' || isSubmitting}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              >
                <option value="PhanTram">Phần trăm (%)</option>
                <option value="TienMat">Tiền mặt (VNĐ)</option>
              </select>
            </div>

            {/* Giá trị giảm */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giá trị giảm <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="giaTriGiam"
                value={formData.giaTriGiam}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                placeholder={formData.loaiGiamGia === 'PhanTram' ? 'VD: 10' : 'VD: 50000'}
                min="0"
              />
              {errors.giaTriGiam && <span className="text-red-500 text-xs">{errors.giaTriGiam}</span>}
            </div>

            {/* Giảm tối đa */}
            {formData.loaiGiamGia === 'PhanTram' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giảm tối đa (VNĐ)
                </label>
                <input
                  type="number"
                  name="giamToiDa"
                  value={formData.giamToiDa}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="VD: 100000"
                  min="0"
                />
              </div>
            )}

            {/* Đơn hàng tối thiểu */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Đơn hàng tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                name="donHangToiThieu"
                value={formData.donHangToiThieu}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                placeholder="VD: 200000"
                min="0"
              />
            </div>

            {/* Ngày bắt đầu */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="ngayBatDau"
                value={formData.ngayBatDau}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              />
              {errors.ngayBatDau && <span className="text-red-500 text-xs">{errors.ngayBatDau}</span>}
            </div>

            {/* Ngày kết thúc */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="ngayKetThuc"
                value={formData.ngayKetThuc}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              />
              {errors.ngayKetThuc && <span className="text-red-500 text-xs">{errors.ngayKetThuc}</span>}
            </div>

            {/* Số lượng */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số lượng (để trống = vô hạn)
              </label>
              <input
                type="number"
                name="soLuong"
                value={formData.soLuong}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                placeholder="VD: 100"
                min="1"
              />
            </div>

            {/* Sử dụng tối đa mỗi người */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sử dụng tối đa/người
              </label>
              <input
                type="number"
                name="suDungToiDaMoiNguoi"
                value={formData.suDungToiDaMoiNguoi}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                min="1"
              />
            </div>
          </div>

          {/* Mô tả */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="moTa"
              value={formData.moTa}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              rows="3"
              placeholder="Nhập mô tả voucher..."
            />
          </div>

          {/* Checkbox */}
          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="apDungChoKhachVangLai"
                checked={formData.apDungChoKhachVangLai}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Áp dụng cho khách vãng lai
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
            >
              <X size={18} />
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Đang xử lý...
                </>
              ) : mode === 'create' ? (
                <>
                  <Check size={18} />
                  Tạo mới
                </>
              ) : (
                <>
                  <Save size={18} />
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

export default VoucherManagementPage;
