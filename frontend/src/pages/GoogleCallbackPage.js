import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

const GoogleCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser, user, loading } = useAuth();
  const [processing, setProcessing] = useState(false);
  const hasProcessed = useRef(false);
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Chỉ xử lý callback một lần
    if (hasProcessed.current) return;
    
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const success = searchParams.get('success');
      const error = searchParams.get('error');

      if (error) {
        console.error('Google OAuth error:', error);
        let errorMessage = 'Đăng nhập bằng Google thất bại';
        
        switch (error) {
          case 'google_auth_failed':
            errorMessage = 'Xác thực Google thất bại. Vui lòng thử lại.';
            break;
          case 'account_disabled':
            errorMessage = 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.';
            break;
          case 'server_error':
            errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
            break;
          default:
            errorMessage = 'Có lỗi xảy ra trong quá trình đăng nhập.';
        }

        navigate('/login', { 
          state: { error: errorMessage },
          replace: true
        });
        return;
      }

      if (success === 'true' && token) {
        try {
          hasProcessed.current = true;
          setProcessing(true);
          
          console.log('🔄 Đang xử lý Google callback...');
          
          // Kiểm tra updateUser có tồn tại không
          if (!updateUser || typeof updateUser !== 'function') {
            console.error('❌ updateUser không tồn tại hoặc không phải function:', updateUser);
            throw new Error('Lỗi xác thực: updateUser không khả dụng');
          }
          
          // Fetch user profile và lưu token vào localStorage
          const result = await authService.handleGoogleCallback(token);
          console.log('✅ Đã lưu token và user vào localStorage:', result.user);
          
          // Cập nhật auth context
          if (result.user) {
            updateUser(result.user);
            console.log('✅ Đã cập nhật user trong AuthContext');
          } else {
            throw new Error('Không nhận được thông tin user từ callback');
          }
          
          // Đợi một chút để React cập nhật state
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (err) {
          console.error('Error handling Google callback:', err);
          hasProcessed.current = false;
          setProcessing(false);
          navigate('/login', { 
            state: { error: err.message || 'Không thể lấy thông tin người dùng. Vui lòng thử lại.' },
            replace: true
          });
        }
      } else {
        navigate('/login', { 
          state: { error: 'Đăng nhập bằng Google thất bại' },
          replace: true
        });
      }
    };

    handleCallback();
  }, [searchParams, navigate, updateUser]);

  // Đợi user được set trong context và không còn loading, sau đó mới navigate
  useEffect(() => {
    // Chỉ navigate khi:
    // 1. Đã xử lý callback (processing = true)
    // 2. AuthContext không còn loading
    // 3. User đã được set
    // 4. Chưa navigate lần nào
    if (processing && !loading && user && !hasNavigated.current) {
      console.log('✅ User đã có trong context và không còn loading, chuyển hướng về trang chủ...');
      hasNavigated.current = true;
      
      // Đợi một chút để đảm bảo mọi thứ đã sẵn sàng
      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [processing, loading, user, navigate]);

  // Timeout fallback: Nếu sau 5 giây vẫn chưa navigate, force redirect
  useEffect(() => {
    if (processing && !hasNavigated.current) {
      const timeout = setTimeout(() => {
        console.log('⏰ Timeout: Force redirect về trang chủ...');
        hasNavigated.current = true;
        const savedToken = authService.getToken();
        const savedUser = authService.getUser();
        
        if (savedToken && savedUser) {
          window.location.href = '/';
        } else {
          navigate('/login', { 
            state: { error: 'Lỗi xác thực. Vui lòng đăng nhập lại.' },
            replace: true
          });
        }
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [processing, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-rose-50">
      <div className="text-center p-8 bg-white rounded-cute shadow-bubble border-2 border-primary-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Đang xử lý đăng nhập...</h2>
        <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;

