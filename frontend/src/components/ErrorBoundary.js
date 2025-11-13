import React from 'react';

/**
 * Error Boundary Component
 * Bắt các runtime errors trong React components
 * Hiển thị fallback UI thay vì white screen
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Cập nhật state để hiển thị fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('❌ Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // TODO: Có thể gửi error lên logging service (Sentry, LogRocket, etc.)
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null 
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="text-8xl mb-6">😢</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Oops! Có lỗi xảy ra
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Ứng dụng gặp sự cố không mong muốn. Chúng tôi rất xin lỗi về điều này.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-bold text-red-800 mb-2">Chi tiết lỗi (Development mode):</h3>
                <pre className="text-xs text-red-700 overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-full hover:shadow-lg transition-all"
              >
                🏠 Về trang chủ
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-all"
              >
                🔄 Tải lại trang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

