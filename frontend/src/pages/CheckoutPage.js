import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCart } from '../api/cartApi';
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

  // ✅ LOAD DANH SÁCH TỈNH/THÀNH
  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const response = await fetch('https://provinces.open-api.vn/api/p/');
      const data = await response.json();
      setProvinces(data);
      console.log('✅ Đã load', data.length, 'tỉnh/thành phố');

      // Nếu có saved info, load districts và wards
      if (savedInfo?.tinhThanhCode) {
        loadDistricts(savedInfo.tinhThanhCode);
      }
    } catch (error) {
      console.error('❌ Lỗi load tỉnh/thành:', error);
      showToast('Không thể tải danh sách tỉnh/thành phố', 'error');
    } finally {
      setLoadingProvinces(false);
    }
  };

  // ✅ LOAD DANH SÁCH QUẬN/HUYỆN
  const loadDistricts = async (provinceCode) => {
    try {
      setLoadingDistricts(true);
      const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      const data = await response.json();
      setDistricts(data.districts || []);
      console.log('✅ Đã load', data.districts?.length || 0, 'quận/huyện');

      // Nếu có saved info, load wards
      if (savedInfo?.quanHuyenCode && savedInfo?.tinhThanhCode === provinceCode) {
        loadWards(savedInfo.quanHuyenCode);
      }
    } catch (error) {
      console.error('❌ Lỗi load quận/huyện:', error);
      showToast('Không thể tải danh sách quận/huyện', 'error');
    } finally {
      setLoadingDistricts(false);
    }
  };

  // ✅ LOAD DANH SÁCH PHƯỜNG/XÃ
  const loadWards = async (districtCode) => {
    try {
      setLoadingWards(true);
      const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      const data = await response.json();
      setWards(data.wards || []);
      console.log('✅ Đã load', data.wards?.length || 0, 'phường/xã');
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
      const response = await getCart();
      if (response.success && response.data) {
        const items = response.data.items || [];
        if (items.length === 0) {
          showToast('Giỏ hàng của bạn đang trống', 'warning');
          setTimeout(() => navigate('/cart'), 1500);
          return;
        }
        
        const normalizedItems = items.map(item => ({
          ID: item.id || item.ID,
          SanPhamID: item.sanPhamId || item.SanPhamID,
          SoLuong: item.soLuong || item.SoLuong,
          DonGia: item.donGia || item.DonGia,
          sanPham: {
            ID: item.sanPham?.id || item.sanPham?.ID,
            Ten: item.sanPham?.ten || item.sanPham?.Ten,
            GiaBan: item.sanPham?.giaBan || item.sanPham?.GiaBan,
            Ton: item.sanPham?.ton || item.sanPham?.Ton,
            HinhAnhURL: item.sanPham?.hinhAnhURL || item.sanPham?.HinhAnhURL
          }
        }));
        
        setCartItems(normalizedItems);
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
    const selectedCode = e.target.value;
    const selectedProvince = provinces.find(p => p.code.toString() === selectedCode);
    
    setFormData(prev => ({
      ...prev,
      tinhThanhCode: selectedCode,
      tinhThanhName: selectedProvince?.name || '',
      quanHuyenCode: '',
      quanHuyenName: '',
      phuongXaCode: '',
      phuongXaName: ''
    }));

    // Reset districts và wards
    setDistricts([]);
    setWards([]);

    // Load districts của tỉnh mới
    if (selectedCode) {
      loadDistricts(selectedCode);
    }

    if (errors.tinhThanhCode) {
      setErrors(prev => ({ ...prev, tinhThanhCode: '' }));
    }
  };

  // ✅ XỬ LÝ THAY ĐỔI QUẬN/HUYỆN
  const handleDistrictChange = (e) => {
    const selectedCode = e.target.value;
    const selectedDistrict = districts.find(d => d.code.toString() === selectedCode);
    
    setFormData(prev => ({
      ...prev,
      quanHuyenCode: selectedCode,
      quanHuyenName: selectedDistrict?.name || '',
      phuongXaCode: '',
      phuongXaName: ''
    }));

    // Reset wards
    setWards([]);

    // Load wards của quận mới
    if (selectedCode) {
      loadWards(selectedCode);
    }

    if (errors.quanHuyenCode) {
      setErrors(prev => ({ ...prev, quanHuyenCode: '' }));
    }
  };

  // ✅ XỬ LÝ THAY ĐỔI PHƯỜNG/XÃ
  const handleWardChange = (e) => {
    const selectedCode = e.target.value;
    const selectedWard = wards.find(w => w.code.toString() === selectedCode);
    
    setFormData(prev => ({
      ...prev,
      phuongXaCode: selectedCode,
      phuongXaName: selectedWard?.name || ''
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
      return total + (parseFloat(item.DonGia) * item.SoLuong);
    }, 0);
  };

  const calculateShippingFee = () => {
    return 30000;
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.SoLuong, 0);
  };

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
          tinhThanh: formData.tinhThanhName,
          quanHuyen: formData.quanHuyenName,
          phuongXa: formData.phuongXaName,
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
      <div className="max-w-7xl mx-auto px-4 py-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Title + Form */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Thông Tin Giao Hàng</h1>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Họ và tên */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hoTen"
                  value={formData.hoTen}
                  onChange={handleInputChange}
                  placeholder="Nguyễn Huỳnh Tiến Khải"
                  className={`w-full px-3 py-2 border ${errors.hoTen ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.hoTen && (
                  <p className="mt-1 text-xs text-red-500">{errors.hoTen}</p>
                )}
              </div>

              {/* Email và Số điện thoại - 2 cột */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ionff01@gmail.com"
                    className={`w-full px-3 py-2 border ${errors.email ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="dienThoai"
                    value={formData.dienThoai}
                    onChange={handleInputChange}
                    placeholder="0916775071"
                    className={`w-full px-3 py-2 border ${errors.dienThoai ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.dienThoai && (
                    <p className="mt-1 text-xs text-red-500">{errors.dienThoai}</p>
                  )}
                </div>
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="diaChi"
                  value={formData.diaChi}
                  onChange={handleInputChange}
                  placeholder="68, Tran Khanh Du"
                  className={`w-full px-3 py-2 border ${errors.diaChi ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.diaChi && (
                  <p className="mt-1 text-xs text-red-500">{errors.diaChi}</p>
                )}
              </div>

              {/* Tỉnh/thành, Quận/huyện, Phường/xã - 3 cột */}
              <div className="grid grid-cols-3 gap-3">
                {/* Tỉnh/Thành phố */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Tỉnh / thành <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tinhThanhCode"
                    value={formData.tinhThanhCode}
                    onChange={handleProvinceChange}
                    disabled={loadingProvinces}
                    className={`w-full px-3 py-2 border ${errors.tinhThanhCode ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
                  >
                    <option value="">
                      {loadingProvinces ? 'Đang tải...' : 'Chọn tỉnh/thành'}
                    </option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {errors.tinhThanhCode && (
                    <p className="mt-1 text-xs text-red-500">{errors.tinhThanhCode}</p>
                  )}
                </div>

                {/* Quận/Huyện */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Quận / huyện <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="quanHuyenCode"
                    value={formData.quanHuyenCode}
                    onChange={handleDistrictChange}
                    disabled={!formData.tinhThanhCode || loadingDistricts}
                    className={`w-full px-3 py-2 border ${errors.quanHuyenCode ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  >
                    <option value="">
                      {loadingDistricts ? 'Đang tải...' : 'Chọn quận/huyện'}
                    </option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  {errors.quanHuyenCode && (
                    <p className="mt-1 text-xs text-red-500">{errors.quanHuyenCode}</p>
                  )}
                </div>

                {/* Phường/Xã */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Phường / xã <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="phuongXaCode"
                    value={formData.phuongXaCode}
                    onChange={handleWardChange}
                    disabled={!formData.quanHuyenCode || loadingWards}
                    className={`w-full px-3 py-2 border ${errors.phuongXaCode ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  >
                    <option value="">
                      {loadingWards ? 'Đang tải...' : 'Chọn phường/xã'}
                    </option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                  {errors.phuongXaCode && (
                    <p className="mt-1 text-xs text-red-500">{errors.phuongXaCode}</p>
                  )}
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  name="ghiChu"
                  value={formData.ghiChu}
                  onChange={handleInputChange}
                  placeholder="Ghi chú về đơn hàng..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  ← Giỏ hàng
                </button>
                
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-lg hover:from-pink-500 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? 'Đang xử lý...' : 'Tiếp tục đến phương thức thanh toán →'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-0 invisible h-0">Placeholder</h1>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-6">
              <h3 className="text-base font-bold text-gray-800 mb-3">
                Đơn hàng ({getTotalItems()} sản phẩm)
              </h3>
              
              {/* Danh sách sản phẩm */}
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pt-2 pr-1">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-3 pb-3 border-b border-gray-100">
                    <div className="relative flex-shrink-0 w-14 h-14">
                      <img
                        src={buildImageUrl(item.sanPham?.HinhAnhURL)}
                        alt={item.sanPham?.Ten}
                        className="w-full h-full object-cover rounded-lg border"
                        onError={handleImageError}
                      />
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md z-10">
                        {item.SoLuong}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-800 line-clamp-2">
                        {item.sanPham?.Ten}
                      </div>
                      <div className="text-sm font-semibold text-red-600 mt-1">
                        {(parseFloat(item.DonGia) * item.SoLuong).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mã giảm giá */}
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Mã giảm giá"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
                    Sử dụng
                  </button>
                </div>
              </div>

              {/* Tính toán */}
              <div className="space-y-2 mb-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính:</span>
                  <span className="font-medium">{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium">{shippingFee.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>

              {/* Tổng cộng */}
              <div className="pt-3 border-t-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-800">Tổng cộng:</span>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">VND</div>
                    <div className="text-2xl font-bold text-red-600">
                      {total.toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                </div>
              </div>

              {/* Login reminder */}
              {!user && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Khách hàng thân thiết:</strong> Đăng nhập để tích điểm và nhận ưu đãi!
                  </p>
                  <Link to="/login" className="text-xs text-blue-600 hover:underline font-medium mt-1 inline-block">
                    Đăng nhập ngay →
                  </Link>
                </div>
              )}
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
