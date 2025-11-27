import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Image, 
  Plus, 
  Trash2, 
  Eye, 
  Save, 
  X, 
  Upload,
  Edit2,
  CheckCircle,
  ShoppingBag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import { Button, Card, Input } from '../components/ui';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { bannerService } from '../services';
import config from '../config';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import '../pages/Homepage.css';

const BannerManagementPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [previewBanner, setPreviewBanner] = useState(null);
  const previewSwiperRef = useRef(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    image: null,
    imageUrl: '',
    link: '',
    order: 0,
    isActive: true
  });
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  // Load banners từ API
  useEffect(() => {
    loadBanners();
  }, []);

  // Hàm xử lý URL ảnh banner
  const buildBannerImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    
    // Nếu đã là full URL (http/https) hoặc base64, return luôn
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:image/')) {
      return imageUrl;
    }
    
    // Nếu là đường dẫn tương đối (/uploads/banner/...), thêm API_BASE_URL
    if (imageUrl.startsWith('/uploads/')) {
      return `${config.API_BASE_URL}${imageUrl}`;
    }
    
    // Fallback: thêm /uploads/ nếu thiếu
    if (!imageUrl.startsWith('/')) {
      return `${config.API_BASE_URL}/uploads/${imageUrl}`;
    }
    
    return imageUrl;
  };

  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await bannerService.getAllBanners();
      if (response.success && response.data) {
        // Map từ API format sang format frontend
        const mappedBanners = response.data.banners.map(b => ({
          id: b.id,
          imageUrl: buildBannerImageUrl(b.hinhAnhUrl),
          link: b.link,
          order: b.thuTu,
          isActive: b.isActive
        }));
        setBanners(mappedBanners);
      }
    } catch (error) {
      console.error('Error loading banners:', error);
      showToast(error.response?.data?.message || 'Lỗi khi tải danh sách banner', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('Kích thước file không được vượt quá 10MB', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: file,
          imageUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreview = (banner) => {
    setPreviewBanner(banner);
    setPreviewModal(true);
  };

  const handleAddNew = () => {
    setEditingBanner(null);
    setFormData({
      image: null,
      imageUrl: '',
      link: '/products',
      order: banners.length + 1,
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    // Lấy URL gốc từ banner (có thể đã được build hoặc chưa)
    // Nếu banner.imageUrl đã có API_BASE_URL, giữ nguyên; nếu chưa thì build lại
    const originalImageUrl = banner.hinhAnhUrl || banner.imageUrl;
    const imageUrl = originalImageUrl && !originalImageUrl.includes(config.API_BASE_URL) 
      ? buildBannerImageUrl(originalImageUrl) 
      : (banner.imageUrl || originalImageUrl);
    
    setFormData({
      image: null,
      imageUrl: imageUrl,
      link: banner.link || '/products',
      order: banner.order || banner.thuTu || 1,
      isActive: banner.isActive !== undefined ? banner.isActive : true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
      try {
        setLoading(true);
        const response = await bannerService.deleteBanner(id);
        if (response.success) {
          showToast('Đã xóa banner thành công!', 'success');
          await loadBanners(); // Reload danh sách
        }
      } catch (error) {
        console.error('Error deleting banner:', error);
        showToast(error.response?.data?.message || 'Lỗi khi xóa banner', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.image && !formData.imageUrl) {
      showToast('Vui lòng chọn hình ảnh', 'error');
      return;
    }

    try {
      setLoading(true);
      
      // ✅ TẠO FORMDATA ĐỂ UPLOAD FILE
      const formDataToSend = new FormData();
      
      // Nếu có file mới, upload file
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      } else if (formData.imageUrl && formData.imageUrl.startsWith('data:image/')) {
        // Nếu là base64 (tương thích ngược), gửi như cũ
        formDataToSend.append('hinhAnhUrl', formData.imageUrl);
      } else {
        // Nếu chỉ có URL (khi edit không đổi ảnh), không gửi gì cả
        // Backend sẽ giữ nguyên ảnh cũ
      }
      
      formDataToSend.append('link', formData.link || '/products');
      formDataToSend.append('thuTu', formData.order || 1);
      formDataToSend.append('isActive', formData.isActive !== undefined ? formData.isActive : true);

      let response;
      if (editingBanner) {
        // Update existing banner
        response = await bannerService.updateBanner(editingBanner.id, formDataToSend);
      } else {
        // Create new banner - bắt buộc phải có file
        if (!formData.image) {
          showToast('Vui lòng chọn hình ảnh để tạo banner mới', 'error');
          setLoading(false);
          return;
        }
        response = await bannerService.createBanner(formDataToSend);
      }

      if (response.success) {
        showToast(editingBanner ? 'Đã cập nhật banner thành công!' : 'Đã tạo banner thành công!', 'success');
        setShowModal(false);
        resetForm();
        await loadBanners(); // Reload danh sách
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      showToast(error.response?.data?.message || 'Lỗi khi lưu banner', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      image: null,
      imageUrl: '',
      link: '/products',
      order: banners.length + 1,
      isActive: true
    });
    setEditingBanner(null);
  };

  const handleToggleActive = async (id) => {
    try {
      setLoading(true);
      const response = await bannerService.toggleBannerStatus(id);
      if (response.success) {
        showToast(response.message || 'Đã cập nhật trạng thái banner!', 'success');
        await loadBanners(); // Reload danh sách
      }
    } catch (error) {
      console.error('Error toggling banner status:', error);
      showToast(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái banner', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const sortedBanners = [...banners].sort((a, b) => (a.order || a.thuTu || 0) - (b.order || b.thuTu || 0));

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Image className="text-primary-500" size={32} />
              Quản lý Banner
            </h1>
            <p className="text-gray-600 mt-2">Thêm, sửa, xóa và quản lý banner hiển thị trên trang chủ</p>
          </div>
          <Button
            onClick={handleAddNew}
            className="bg-primary-500 hover:bg-primary-600 text-white"
            icon={<Plus size={20} />}
          >
            Thêm Banner Mới
          </Button>
        </div>

        {/* Banner List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBanners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={banner.imageUrl}
                  alt={`Banner ${banner.order}`}
                  className="w-full h-48 object-cover bg-gray-100"
                  onError={(e) => {
                    console.error('❌ Lỗi load ảnh banner:', banner.imageUrl);
                    e.target.src = '/barbie.jpg'; // Fallback image
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  {banner.isActive ? (
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Đang hiển thị
                    </span>
                  ) : (
                    <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Đã ẩn
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Thứ tự: {banner.order}</span>
                  <span className="text-sm text-gray-600">Link: {banner.link || 'N/A'}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePreview(banner)}
                    variant="outline"
                    size="sm"
                    icon={<Eye size={16} />}
                    className="flex-1"
                  >
                    Xem trước
                  </Button>
                  <Button
                    onClick={() => handleEdit(banner)}
                    variant="outline"
                    size="sm"
                    icon={<Edit2 size={16} />}
                    className="flex-1"
                  >
                    Sửa
                  </Button>
                  <Button
                    onClick={() => handleDelete(banner.id)}
                    variant="outline"
                    size="sm"
                    icon={<Trash2 size={16} />}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    Xóa
                  </Button>
                </div>
                <Button
                  onClick={() => handleToggleActive(banner.id)}
                  variant={banner.isActive ? "outline" : "primary"}
                  size="sm"
                  className="w-full"
                >
                  {banner.isActive ? 'Ẩn banner' : 'Hiển thị banner'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {sortedBanners.length === 0 && (
          <Card className="text-center py-12">
            <Image size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Chưa có banner nào</p>
            <Button
              onClick={handleAddNew}
              className="mt-4"
              icon={<Plus size={20} />}
            >
              Thêm banner đầu tiên
            </Button>
          </Card>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingBanner ? 'Sửa Banner' : 'Thêm Banner Mới'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all border-2 border-white"
                  aria-label="Đóng"
                  title="Đóng"
                >
                  <X size={24} strokeWidth={3} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình ảnh Banner *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="banner-upload"
                      />
                      <label
                        htmlFor="banner-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload size={32} className="text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Click để chọn hình ảnh
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          (JPG, PNG, tối đa 10MB)
                        </span>
                      </label>
                    </div>
                    {formData.imageUrl && (
                      <div className="mt-4">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>

                  <Input
                    label="Link điều hướng"
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="/products"
                  />

                  <Input
                    label="Thứ tự hiển thị"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    min="1"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-primary-500"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      Hiển thị banner
                    </label>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Xem trước trên trang chủ</h3>
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="relative bg-gradient-to-br from-primary-50 via-rose-50 to-cream-100 rounded-lg overflow-hidden">
                      <div className="grid md:grid-cols-2 gap-4 p-4">
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold text-gray-800">
                            Chào mừng đến với <span className="text-primary-500">ToyStore</span>
                          </h2>
                          <p className="text-sm text-gray-600">
                            Thế giới đồ chơi tuyệt vời dành cho bé yêu của bạn
                          </p>
                        </div>
                        <div className="relative w-full h-48 bg-white rounded-lg overflow-hidden shadow-lg">
                          {formData.imageUrl ? (
                            <img
                              src={formData.imageUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                              <div className="text-center">
                                <Image size={32} className="mx-auto mb-2" />
                                <p className="text-xs">Chưa có hình ảnh</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="px-4 pb-4 text-xs text-gray-600 space-y-1">
                        <p><strong>Link:</strong> {formData.link || '/products'}</p>
                        <p><strong>Thứ tự:</strong> {formData.order}</p>
                        <p><strong>Trạng thái:</strong> {formData.isActive ? 'Đang hiển thị' : 'Đã ẩn'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
                  icon={<Save size={20} />}
                >
                  {editingBanner ? 'Cập nhật' : 'Lưu Banner'}
                </Button>
                <Button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Hủy
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Preview Modal - Hiển thị trang chủ với banner */}
        {previewModal && previewBanner && (
          <div 
            className="fixed bg-black/90 z-[9999] overflow-y-auto" 
            style={{ 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              width: '100vw',
              height: '100vh',
              margin: 0,
              padding: 0
            }}
          >
            <div className="relative w-full min-h-screen bg-white" style={{ margin: 0, padding: 0 }}>
              <button
                onClick={() => setPreviewModal(false)}
                className="fixed top-4 right-4 z-[10000] bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-2xl transition-all border-2 border-white"
                aria-label="Đóng"
                title="Đóng"
              >
                <X size={28} strokeWidth={3} />
              </button>
              
              {/* Preview Header */}
              <div className="bg-gray-50 border-b px-6 py-4" style={{ margin: 0 }}>
                <h3 className="text-xl font-bold text-gray-800">Xem trước trên trang chủ</h3>
                <p className="text-sm text-gray-600 mt-1">Banner sẽ hiển thị như thế này trên trang chủ</p>
              </div>

              {/* Preview Content - Hero Section */}
              <div className="p-6">
                <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-rose-50 to-cream-100 py-20 rounded-lg">
                  <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float">🧸</div>
                  <div className="absolute top-32 right-20 text-5xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>🎀</div>
                  <div className="absolute bottom-20 left-1/4 text-5xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>🎈</div>
                  <div className="absolute bottom-32 right-1/3 text-4xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}>⭐</div>

                  <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                      <div className="space-y-6 animate-slide-up">
                        <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-800 leading-tight">
                          Chào mừng đến với{' '}
                          <span className="text-gradient-primary">ToyStore</span>
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                          Thế giới đồ chơi tuyệt vời dành cho bé yêu của bạn
                        </p>
                        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-cute shadow-soft w-fit">
                          <span className="text-2xl">👋</span>
                          <p className="text-gray-700">
                            Xin chào <span className="font-bold text-primary-600">Admin</span>!
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-4 pt-4">
                          <Button 
                            variant="primary" 
                            size="lg"
                            icon={<ShoppingBag size={20} />}
                            className="bg-gradient-to-r from-primary-400 to-primary-500 text-white"
                          >
                            Mua sắm ngay
                          </Button>
                        </div>
                      </div>

                      {/* Banner Preview */}
                      <div className="relative">
                        <div className="relative w-full h-96">
                          <Swiper
                            onSwiper={(swiper) => {
                              previewSwiperRef.current = swiper;
                            }}
                            modules={[Navigation, Pagination, Autoplay, EffectFade]}
                            spaceBetween={0}
                            slidesPerView={1}
                            pagination={{
                              clickable: true,
                              bulletClass: 'swiper-pagination-bullet-custom',
                            }}
                            autoplay={{
                              delay: 5000,
                              disableOnInteraction: false,
                            }}
                            effect="fade"
                            fadeEffect={{
                              crossFade: true
                            }}
                            loop={false}
                            className="banner-swiper rounded-bubble overflow-hidden h-full"
                          >
                            <SwiperSlide>
                              <img 
                                src={previewBanner.imageUrl} 
                                alt={`Banner ${previewBanner.order}`}
                                className="w-full h-full object-cover cursor-pointer"
                              />
                            </SwiperSlide>
                          </Swiper>
                          <button 
                            onClick={() => previewSwiperRef.current?.slidePrev()}
                            className="swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all opacity-0 pointer-events-none"
                            aria-label="Previous slide"
                          >
                            <ChevronLeft size={20} className="text-gray-800" />
                          </button>
                          <button 
                            onClick={() => previewSwiperRef.current?.slideNext()}
                            className="swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all opacity-0 pointer-events-none"
                            aria-label="Next slide"
                          >
                            <ChevronRight size={20} className="text-gray-800" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Banner Info */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Thứ tự:</span>
                      <span className="ml-2 text-gray-600">{previewBanner.order}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Link:</span>
                      <span className="ml-2 text-gray-600">{previewBanner.link || '/products'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Trạng thái:</span>
                      <span className={`ml-2 ${previewBanner.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                        {previewBanner.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            duration={3000}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default BannerManagementPage;

