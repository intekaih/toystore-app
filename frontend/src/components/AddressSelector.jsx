import React, { useState, useEffect } from 'react';
import shippingService from '../services/shippingService';

/**
 * 🗺️ AddressSelector Component
 * Component chọn địa chỉ giao hàng sử dụng API GHN
 * 
 * Usage:
 * <AddressSelector
 *   value={{ provinceId, districtId, wardCode }}
 *   onChange={(address) => console.log(address)}
 *   onShippingFeeCalculated={(fee) => console.log(fee)}
 * />
 */
const AddressSelector = ({ 
  value = {}, 
  onChange, 
  onShippingFeeCalculated,
  calculateFee = false,
  disabled = false,
  className = ''
}) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [selectedProvince, setSelectedProvince] = useState(value.provinceId || '');
  const [selectedDistrict, setSelectedDistrict] = useState(value.districtId || '');
  const [selectedWard, setSelectedWard] = useState(value.wardCode || '');
  
  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
    shippingFee: false
  });
  
  const [error, setError] = useState(null);
  const [shippingFee, setShippingFee] = useState(null);

  // 🔄 Load danh sách tỉnh/thành khi component mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // 🔄 Load quận/huyện khi chọn tỉnh
  useEffect(() => {
    if (selectedProvince) {
      loadDistricts(selectedProvince);
    } else {
      setDistricts([]);
      setSelectedDistrict('');
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedProvince]);

  // 🔄 Load phường/xã khi chọn quận
  useEffect(() => {
    if (selectedDistrict) {
      loadWards(selectedDistrict);
    } else {
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedDistrict]);

  // 🔄 Tính phí ship khi đủ thông tin địa chỉ
  useEffect(() => {
    if (calculateFee && selectedDistrict && selectedWard) {
      calculateShippingFee();
    }
  }, [selectedDistrict, selectedWard, calculateFee]);

  // 📍 Load danh sách tỉnh/thành
  const loadProvinces = async () => {
    try {
      setLoading(prev => ({ ...prev, provinces: true }));
      setError(null);
      
      console.log('🔍 [AddressSelector] Đang load provinces...');
      console.log('🔍 [AddressSelector] API URL:', shippingService.api?.defaults?.baseURL);
      
      const response = await shippingService.getProvinces();
      
      console.log('✅ [AddressSelector] Response provinces:', response);
      
      if (response.success) {
        setProvinces(response.data);
        console.log('✅ Đã load', response.data.length, 'tỉnh/thành');
      } else {
        console.error('❌ [AddressSelector] Load provinces failed:', response);
        setError(response.message || 'Không thể tải danh sách tỉnh/thành');
      }
    } catch (error) {
      console.error('❌ [AddressSelector] Error loading provinces:', error);
      console.error('❌ [AddressSelector] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Không thể tải danh sách tỉnh/thành. Vui lòng thử lại.');
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }));
    }
  };

  // 📍 Load danh sách quận/huyện
  const loadDistricts = async (provinceId) => {
    try {
      setLoading(prev => ({ ...prev, districts: true }));
      setError(null);
      
      const response = await shippingService.getDistricts(provinceId);
      
      if (response.success) {
        setDistricts(response.data);
        console.log('✅ Đã load', response.data.length, 'quận/huyện');
      }
    } catch (error) {
      console.error('❌ Lỗi load quận/huyện:', error);
      setError('Không thể tải danh sách quận/huyện. Vui lòng thử lại.');
    } finally {
      setLoading(prev => ({ ...prev, districts: false }));
    }
  };

  // 📍 Load danh sách phường/xã
  const loadWards = async (districtId) => {
    try {
      setLoading(prev => ({ ...prev, wards: true }));
      setError(null);
      
      const response = await shippingService.getWards(districtId);
      
      if (response.success) {
        setWards(response.data);
        console.log('✅ Đã load', response.data.length, 'phường/xã');
      }
    } catch (error) {
      console.error('❌ Lỗi load phường/xã:', error);
      setError('Không thể tải danh sách phường/xã. Vui lòng thử lại.');
    } finally {
      setLoading(prev => ({ ...prev, wards: false }));
    }
  };

  // 💰 Tính phí ship
  const calculateShippingFee = async () => {
    try {
      setLoading(prev => ({ ...prev, shippingFee: true }));
      
      const response = await shippingService.calculateShippingFee({
        toDistrictId: parseInt(selectedDistrict),
        toWardCode: selectedWard,
        weight: 500, // Mặc định 500g
        insuranceValue: 0
      });
      
      if (response.success) {
        setShippingFee(response.data.shippingFee);
        
        if (onShippingFeeCalculated) {
          onShippingFeeCalculated(response.data.shippingFee);
        }
        
        console.log('✅ Phí ship:', response.formattedFee);
      }
    } catch (error) {
      console.error('❌ Lỗi tính phí ship:', error);
    } finally {
      setLoading(prev => ({ ...prev, shippingFee: false }));
    }
  };

  // 🎯 Handle thay đổi tỉnh/thành
  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    const province = provinces.find(p => p.provinceId === parseInt(provinceId));
    
    setSelectedProvince(provinceId);
    setSelectedDistrict('');
    setSelectedWard('');
    setShippingFee(null);
    
    if (onChange) {
      onChange({
        provinceId: provinceId ? parseInt(provinceId) : null,
        provinceName: province?.provinceName || '',
        districtId: null,
        districtName: '',
        wardCode: null,
        wardName: ''
      });
    }
  };

  // 🎯 Handle thay đổi quận/huyện
  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    const district = districts.find(d => d.districtId === parseInt(districtId));
    const province = provinces.find(p => p.provinceId === parseInt(selectedProvince));
    
    setSelectedDistrict(districtId);
    setSelectedWard('');
    setShippingFee(null);
    
    if (onChange) {
      onChange({
        provinceId: selectedProvince ? parseInt(selectedProvince) : null,
        provinceName: province?.provinceName || '',
        districtId: districtId ? parseInt(districtId) : null,
        districtName: district?.districtName || '',
        wardCode: null,
        wardName: ''
      });
    }
  };

  // 🎯 Handle thay đổi phường/xã
  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const ward = wards.find(w => w.wardCode === wardCode);
    const district = districts.find(d => d.districtId === parseInt(selectedDistrict));
    const province = provinces.find(p => p.provinceId === parseInt(selectedProvince));
    
    setSelectedWard(wardCode);
    
    if (onChange) {
      onChange({
        provinceId: selectedProvince ? parseInt(selectedProvince) : null,
        provinceName: province?.provinceName || '',
        districtId: selectedDistrict ? parseInt(selectedDistrict) : null,
        districtName: district?.districtName || '',
        wardCode: wardCode || null,
        wardName: ward?.wardName || ''
      });
    }
  };

  return (
    <div className={`address-selector ${className}`}>
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Tỉnh/Thành phố */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tỉnh/Thành phố <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedProvince}
          onChange={handleProvinceChange}
          disabled={disabled || loading.provinces}
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">-- Chọn Tỉnh/Thành phố --</option>
          {provinces.map((province) => (
            <option key={province.provinceId} value={province.provinceId}>
              {province.provinceName}
            </option>
          ))}
        </select>
        {loading.provinces && (
          <p className="mt-1 text-xs text-gray-500">Đang tải danh sách...</p>
        )}
      </div>

      {/* Quận/Huyện */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Quận/Huyện <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedDistrict}
          onChange={handleDistrictChange}
          disabled={disabled || !selectedProvince || loading.districts}
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">-- Chọn Quận/Huyện --</option>
          {districts.map((district) => (
            <option key={district.districtId} value={district.districtId}>
              {district.districtName}
            </option>
          ))}
        </select>
        {loading.districts && (
          <p className="mt-1 text-xs text-gray-500">Đang tải danh sách...</p>
        )}
      </div>

      {/* Phường/Xã */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Phường/Xã <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedWard}
          onChange={handleWardChange}
          disabled={disabled || !selectedDistrict || loading.wards}
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">-- Chọn Phường/Xã --</option>
          {wards.map((ward) => (
            <option key={ward.wardCode} value={ward.wardCode}>
              {ward.wardName}
            </option>
          ))}
        </select>
        {loading.wards && (
          <p className="mt-1 text-xs text-gray-500">Đang tải danh sách...</p>
        )}
      </div>

      {/* Phí ship (nếu có) */}
      {calculateFee && shippingFee !== null && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Phí vận chuyển:</span>
            <span className="text-lg font-bold text-green-600">
              {shippingFee.toLocaleString('vi-VN')} ₫
            </span>
          </div>
          {loading.shippingFee && (
            <p className="mt-1 text-xs text-gray-500">Đang tính phí vận chuyển...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressSelector;