import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cartService, shippingService } from '../services'; // ✅ Sử dụng services
import MainLayout from '../layouts/MainLayout';
import { Loading } from '../components/ui';
import Toast from '../components/Toast';
import config from '../config';

const CheckoutPage = () => {
  const API_BASE_URL = config.API_BASE_URL;
  
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return '/barbie.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${API_BASE_URL}${imagePath}`;
    if (!imagePath.startsWith('/')) return `${API_BASE_URL}/uploads/${imagePath}`;
    return '/barbie.jpg';
  };
  
  const handleImageError = (e) => {
    if (!e.target.src.includes('barbie.jpg')) {
      e.target.src = '/barbie.jpg';
    }
  };

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ STATE CHO API ĐỊA CHỈ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // ✅ LƯU THÔNG TIN KHÁCH HÀNG VÀO LOCALSTORAGE
  const STORAGE_KEY = 'checkout_customer_info';

  const loadSavedInfo = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved info:', e);
      }
    }
    return null;
  };

  const savedInfo = loadSavedInfo();

  const [formData, setFormData] = useState({
    hoTen: savedInfo?.hoTen || user?.hoTen || '',
    email: savedInfo?.email || user?.email || '',
    dienThoai: savedInfo?.dienThoai || user?.dienThoai || '',
    diaChi: savedInfo?.diaChi || '',
    tinhThanhCode: savedInfo?.tinhThanhCode || '',
    tinhThanhName: savedInfo?.tinhThanhName || '',
    quanHuyenCode: savedInfo?.quanHuyenCode || '',
    quanHuyenName: savedInfo?.quanHuyenName || '',
    phuongXaCode: savedInfo?.phuongXaCode || '',
    phuongXaName: savedInfo?.phuongXaName || '',
    ghiChu: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCart();
    loadProvinces();
  }, []);

  // ✅ LOAD DANH SÁCH TỈNH/THÀNH - Sử dụng shippingService
  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const response = await shippingService.getProvinces();
      
      if (response.success && response.data) {
        setProvinces(response.data);
        console.log('✅ Đã load', response.data.length, 'tỉnh/thành phố');

        // Nếu có saved info, load districts và wards
        if (savedInfo?.tinhThanhCode) {
          loadDistricts(savedInfo.tinhThanhCode);
        }
      }
    } catch (error) {
      console.error('❌ Lỗi load tỉnh/thành:', error);
      showToast('Không thể tải danh sách tỉnh/thành phố', 'error');
    } finally {
      setLoadingProvinces(false);
    }
  };

  // ✅ LOAD DANH SÁCH QUẬN/HUYỆN - Sử dụng shippingService
  const loadDistricts = async (provinceCode) => {
    try {
      setLoadingDistricts(true);
      const response = await shippingService.getDistricts(provinceCode);
      
      if (response.success && response.data) {
        setDistricts(response.data);
        console.log('✅ Đã load', response.data.length || 0, 'quận/huyện');

        // Nếu có saved info, load wards
        if (savedInfo?.quanHuyenCode && savedInfo?.tinhThanhCode === provinceCode) {
          loadWards(savedInfo.quanHuyenCode);
        }
      }
    } catch (error) {
      console.error('❌ Lỗi load quận/huyện:', error);
      showToast('Không thể tải danh sách quận/huyện', 'error');
    } finally {
      setLoadingDistricts(false);
    }
  };

  // ✅ LOAD DANH SÁCH PHƯỜNG/XÃ - Sử dụng shippingService
  const loadWards = async (districtCode) => {
    try {
      setLoadingWards(true);
      const response = await shippingService.getWards(districtCode);
      
      if (response.success && response.data) {
        setWards(response.data);
        console.log('✅ Đã load', response.data.length || 0, 'phường/xã');
      }
    } catch (error) {
      console.error('❌ Lỗi load phường/xã:', error);
      showToast('Không thể tải danh sách phường/xã', 'error');
    } finally {
      setLoadingWards(false);
    }
  };

  const loadCart = async () => {
    try {
      setLoading(true);
      
      // ✅ Sử dụng cartService thay vì getCart API
      const response = await cartService.getCart();
      
      if (response.success && response.data) {
        const items = response.data || [];
        if (items.length === 0) {
          showToast('Giỏ hàng của bạn đang trống', 'warning');
          setTimeout(() => navigate('/cart'), 1500);
          return;
        }
        
        setCartItems(items);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      showToast(error.message || 'Không thể tải giỏ hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // ✅ XỬ LÝ THAY ĐỔI TỈNH/THÀNH
  const handleProvinceChange = (e) => {
    const selectedId = e.target.value;
    const selectedProvince = provinces.find(p => p.provinceId.toString() === selectedId);
    
    setFormData(prev => ({
      ...prev,
      tinhThanhCode: selectedId,
      tinhThanhName: selectedProvince?.provinceName || '',
      quanHuyenCode: '',
      quanHuyenName: '',
      phuongXaCode: '',
      phuongXaName: ''
    }));

    // Reset districts và wards
    setDistricts([]);
    setWards([]);

    // Load districts của tỉnh mới
    if (selectedId) {
      loadDistricts(selectedId);
    }

    if (errors.tinhThanhCode) {
      setErrors(prev => ({ ...prev, tinhThanhCode: '' }));
    }
  };

  // ✅ XỬ LÝ THAY ĐỔI QUẬN/HUYỆN
  const handleDistrictChange = (e) => {
    const selectedId = e.target.value;
    const selectedDistrict = districts.find(d => d.districtId.toString() === selectedId);
    
    setFormData(prev => ({
      ...prev,
      quanHuyenCode: selectedId,
      quanHuyenName: selectedDistrict?.districtName || '',
      phuongXaCode: '',
      phuongXaName: ''
    }));

    // Reset wards
    setWards([]);

    // Load wards của quận mới
    if (selectedId) {
      loadWards(selectedId);
    }

    if (errors.quanHuyenCode) {
      setErrors(prev => ({ ...prev, quanHuyenCode: '' }));
    }
  };

  // ✅ XỬ LÝ THAY ĐỔI PHƯỜNG/XÃ
  const handleWardChange = (e) => {
    const selectedCode = e.target.value;
    const selectedWard = wards.find(w => w.wardCode === selectedCode);
    
    setFormData(prev => ({
      ...prev,
      phuongXaCode: selectedCode,
      phuongXaName: selectedWard?.wardName || ''
    }));

    if (errors.phuongXaCode) {
      setErrors(prev => ({ ...prev, phuongXaCode: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.hoTen.trim()) {
      newErrors.hoTen = 'Vui lòng nhập họ tên';
    }

    if (!formData.dienThoai.trim()) {
      newErrors.dienThoai = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.dienThoai.replace(/\s/g, ''))) {
      newErrors.dienThoai = 'Số điện thoại không hợp lệ';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.diaChi.trim()) {
      newErrors.diaChi = 'Vui lòng nhập địa chỉ';
    }

    if (!formData.tinhThanhCode) {
      newErrors.tinhThanhCode = 'Vui lòng chọn Tỉnh/Thành phố';
    }

    if (!formData.quanHuyenCode) {
      newErrors.quanHuyenCode = 'Vui lòng chọn Quận/Huyện';
    }

    if (!formData.phuongXaCode) {
      newErrors.phuongXaCode = 'Vui lòng chọn Phường/Xã';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      // ✅ Hỗ trợ cả 2 format: DonGia (cũ) và donGia (mới từ DTOMapper)
      const price = parseFloat(item.donGia || item.DonGia || 0);
      const quantity = parseInt(item.soLuong || item.SoLuong || 0);
      return total + (price * quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => {
      const quantity = parseInt(item.soLuong || item.SoLuong || 0);
      return total + quantity;
    }, 0);
  };

  const calculateShippingFee = () => {
    const subtotal = calculateTotal();
    // Miễn phí ship cho đơn hàng >= 500k
    return subtotal >= 500000 ? 0 : 30000;
  };

  // ✅ LƯU THÔNG TIN KHÁCH HÀNG
  const saveCustomerInfo = () => {
    const infoToSave = {
      hoTen: formData.hoTen.trim(),
      email: formData.email.trim(),
      dienThoai: formData.dienThoai.trim(),
      diaChi: formData.diaChi.trim(),
      tinhThanhCode: formData.tinhThanhCode,
      tinhThanhName: formData.tinhThanhName,
      quanHuyenCode: formData.quanHuyenCode,
      quanHuyenName: formData.quanHuyenName,
      phuongXaCode: formData.phuongXaCode,
      phuongXaName: formData.phuongXaName
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(infoToSave));
    console.log('✅ Đã lưu thông tin khách hàng');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Vui lòng kiểm tra lại thông tin', 'error');
      return;
    }

    saveCustomerInfo();

    navigate('/payment-method', {
      state: {
        customerInfo: {
          hoTen: formData.hoTen.trim(),
          email: formData.email.trim(),
          dienThoai: formData.dienThoai.trim(),
          diaChi: formData.diaChi.trim(),
          // ✅ THÊM: Gửi cả mã và tên để backend có thể tích hợp GHN
          tinhThanh: formData.tinhThanhName,
          quanHuyen: formData.quanHuyenName,
          phuongXa: formData.phuongXaName,
          maTinhID: formData.tinhThanhCode,      // ✅ Mã tỉnh (cho GHN API)
          maQuanID: formData.quanHuyenCode,      // ✅ Mã quận (cho GHN API)
          maPhuongXa: formData.phuongXaCode,     // ✅ Mã phường (cho GHN API)
          ghiChu: formData.ghiChu
        }
      }
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Đang tải thông tin..." fullScreen />
      </MainLayout>
    );
  }

  const subtotal = calculateTotal();
  const shippingFee = calculateShippingFee();
  const total = subtotal + shippingFee;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-0 py-6">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm flex items-center gap-2">
          <Link to="/cart" className="text-blue-600 hover:underline">Giỏ hàng</Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-700 font-medium">Thông tin giao hàng</span>
          <span className="text-gray-400">›</span>
          <button
            type="button"
            onClick={() => {
              if (validateForm()) {
                saveCustomerInfo();
                navigate('/payment-method', {
                  state: {
                    customerInfo: {
                      hoTen: formData.hoTen.trim(),
                      email: formData.email.trim(),
                      dienThoai: formData.dienThoai.trim(),
                      diaChi: formData.diaChi.trim(),
                      tinhThanh: formData.tinhThanhName,
                      quanHuyen: formData.quanHuyenName,
                      phuongXa: formData.phuongXaName,
                      ghiChu: formData.ghiChu
                    }
                  }
                });
              } else {
                showToast('Vui lòng điền đầy đủ thông tin giao hàng trước', 'warning');
              }
            }}
            className="text-blue-600 hover:underline"
          >
            Phương thức thanh toán
          </button>
        </div>

        {/* Title and Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Title + Form */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Thông Tin Giao Hàng</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Thông tin liên hệ */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">👤</span> Thông tin liên hệ
                </h3>
                
                {/* Họ và tên, Email, Số điện thoại - 3 cột */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-medium">
                      Họ và tên <span className="text-red-500">*</span>
                      <span className="text-gray-500 text-xs font-normal ml-2">(Người nhận hàng)</span>
                    </label>
                    <input
                      type="text"
                      name="hoTen"
                      value={formData.hoTen}
                      onChange={handleInputChange}
                      placeholder="VD: Nguyễn Văn A"
                      className={`w-full px-3 py-2.5 border ${errors.hoTen ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    />
                    {errors.hoTen && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <span>⚠️</span> {errors.hoTen}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-medium">
                      Email <span className="text-red-500">*</span>
                      <span className="text-gray-500 text-xs font-normal ml-2">(Nhận thông báo)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@email.com"
                      className={`w-full px-3 py-2.5 border ${errors.email ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <span>⚠️</span> {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-medium">
                      Số điện thoại <span className="text-red-500">*</span>
                      <span className="text-gray-500 text-xs font-normal ml-2">(Liên hệ giao hàng)</span>
                    </label>
                    <input
                      type="tel"
                      name="dienThoai"
                      value={formData.dienThoai}
                      onChange={handleInputChange}
                      placeholder="0912345678"
                      className={`w-full px-3 py-2.5 border ${errors.dienThoai ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    />
                    {errors.dienThoai && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <span>⚠️</span> {errors.dienThoai}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Địa chỉ giao hàng */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">📍</span> Địa chỉ giao hàng
                </h3>

                {/* Địa chỉ */}
                <div className="mb-3">
                  <label className="block text-sm text-gray-700 mb-1 font-medium">
                    Địa chỉ <span className="text-red-500">*</span>
                    <span className="text-gray-500 text-xs font-normal ml-2">(Số nhà, tên đường)</span>
                  </label>
                  <input
                    type="text"
                    name="diaChi"
                    value={formData.diaChi}
                    onChange={handleInputChange}
                    placeholder="VD: 68 Trần Khánh Dư"
                    className={`w-full px-3 py-2.5 border ${errors.diaChi ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                  />
                  {errors.diaChi && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <span>⚠️</span> {errors.diaChi}
                    </p>
                  )}
                </div>

                {/* Tỉnh/thành, Quận/huyện, Phường/xã */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Tỉnh/Thành phố */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-medium">
                      Tỉnh / Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="tinhThanhCode"
                      value={formData.tinhThanhCode}
                      onChange={handleProvinceChange}
                      disabled={loadingProvinces}
                      className={`w-full px-3 py-2.5 border ${errors.tinhThanhCode ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all`}
                    >
                      <option value="">
                        {loadingProvinces ? '⏳ Đang tải...' : '-- Chọn --'}
                      </option>
                      {provinces.map((province) => (
                        <option key={province.provinceId} value={province.provinceId}>
                          {province.provinceName}
                        </option>
                      ))}
                    </select>
                    {errors.tinhThanhCode && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <span>⚠️</span> {errors.tinhThanhCode}
                      </p>
                    )}
                  </div>

                  {/* Quận/Huyện */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-medium">
                      Quận / Huyện <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="quanHuyenCode"
                      value={formData.quanHuyenCode}
                      onChange={handleDistrictChange}
                      disabled={!formData.tinhThanhCode || loadingDistricts}
                      className={`w-full px-3 py-2.5 border ${errors.quanHuyenCode ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed transition-all`}
                    >
                      <option value="">
                        {loadingDistricts ? '⏳ Đang tải...' : formData.tinhThanhCode ? '-- Chọn --' : '(Chọn tỉnh trước)'}
                      </option>
                      {districts.map((district) => (
                        <option key={district.districtId} value={district.districtId}>
                          {district.districtName}
                        </option>
                      ))}
                    </select>
                    {errors.quanHuyenCode && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <span>⚠️</span> {errors.quanHuyenCode}
                      </p>
                    )}
                  </div>

                  {/* Phường/Xã */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-medium">
                      Phường / Xã <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="phuongXaCode"
                      value={formData.phuongXaCode}
                      onChange={handleWardChange}
                      disabled={!formData.quanHuyenCode || loadingWards}
                      className={`w-full px-3 py-2.5 border ${errors.phuongXaCode ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed transition-all`}
                    >
                      <option value="">
                        {loadingWards ? '⏳ Đang tải...' : formData.quanHuyenCode ? '-- Chọn --' : '(Chọn quận trước)'}
                      </option>
                      {wards.map((ward) => (
                        <option key={ward.wardCode} value={ward.wardCode}>
                          {ward.wardName}
                        </option>
                      ))}
                    </select>
                    {errors.phuongXaCode && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <span>⚠️</span> {errors.phuongXaCode}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <label className="block text-sm text-gray-700 mb-1 font-medium flex items-center gap-2">
                  <span className="text-xl">📝</span>
                  <span>Ghi chú đơn hàng (tùy chọn)</span>
                </label>
                <textarea
                  name="ghiChu"
                  value={formData.ghiChu}
                  onChange={handleInputChange}
                  placeholder="VD: Giao hàng giờ hành chính, gọi trước 15 phút..."
                  rows="3"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bạn có thể để lại lưu ý về thời gian giao hàng, địa chỉ cụ thể hơn...
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  disabled={submitting}
                >
                  <span>←</span> Giỏ hàng
                </button>
                
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-lg hover:from-pink-500 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? '⏳ Đang xử lý...' : (
                    <>
                      <span>Tiếp tục thanh toán</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Đơn Hàng Của Bạn</h2>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-lg p-5 sticky top-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center justify-between">
                <span>Chi tiết đơn hàng</span>
                <span className="text-sm font-normal text-gray-600">({getTotalItems()} sản phẩm)</span>
              </h3>
              
              {/* Danh sách sản phẩm */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item, index) => {
                  // ✅ Hỗ trợ cả 2 format field names
                  const itemPrice = parseFloat(item.donGia || item.DonGia || 0);
                  const itemQuantity = parseInt(item.soLuong || item.SoLuong || 0);
                  const itemImage = item.sanPham?.hinhAnhUrl || item.sanPham?.HinhAnhURL;
                  const itemName = item.sanPham?.ten || item.sanPham?.Ten;
                  
                  return (
                    <div key={index} className="flex gap-3 pb-3 border-b border-gray-100 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <div className="relative flex-shrink-0 w-16 h-16">
                        <img
                          src={buildImageUrl(itemImage)}
                          alt={itemName}
                          className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                          onError={handleImageError}
                        />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md z-10">
                          {itemQuantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-800 line-clamp-2 mb-1">
                          {itemName}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {itemPrice.toLocaleString('vi-VN')}₫ × {itemQuantity}
                          </span>
                          <span className="text-sm font-bold text-red-600">
                            {(itemPrice * itemQuantity).toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tính toán chi tiết */}
              <div className="space-y-3 mb-4 pt-4 border-t-2 border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span className="flex items-center gap-2">
                    <span>📦</span>
                    <span>Tạm tính:</span>
                  </span>
                  <span className="font-semibold">{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <div className="flex items-center gap-2">
                    <span>🚚</span>
                    <span>Phí vận chuyển:</span>
                  </div>
                  <span className="font-semibold text-green-600">{shippingFee.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-green-800">
                  💡 Miễn phí ship cho đơn hàng từ 500.000₫
                </div>
              </div>

              {/* Login reminder */}
              {!user && (
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-900 font-medium mb-2">
                    🌟 <strong>Ưu đãi dành cho thành viên:</strong>
                  </p>
                  <ul className="text-xs text-blue-800 space-y-1 mb-2">
                    <li>• Tích điểm mỗi đơn hàng</li>
                    <li>• Nhận voucher độc quyền</li>
                    <li>• Theo dõi đơn hàng dễ dàng</li>
                  </ul>
                  <Link to="/login" className="text-xs text-blue-700 hover:text-blue-900 font-bold inline-flex items-center gap-1 hover:underline">
                    Đăng nhập ngay → 
                  </Link>
                </div>
              )}

              {/* Info Banner */}
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📦</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-1">Thông tin quan trọng</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Vui lòng kiểm tra kỹ thông tin giao hàng trước khi đặt hàng</li>
                      <li>• Đơn hàng sẽ được giao trong vòng 3-5 ngày làm việc</li>
                      <li>• Miễn phí giao hàng cho đơn hàng trên 500.000₫</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}
    </MainLayout>
  );
};

export default CheckoutPage;
