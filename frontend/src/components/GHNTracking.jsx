/**
 * GHN Tracking Component
 * Hiển thị trạng thái đơn hàng GHN với timeline
 */
import React, { useState, useEffect } from 'react';
import { Truck, RefreshCw, Package, CheckCircle, Clock, MapPin, AlertCircle } from 'lucide-react';
import shippingService from '../services/shippingService';
import '../styles/GHNTracking.css';

const GHNTracking = ({ orderId, orderCode }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId) {
      loadTracking();
    }
  }, [orderId]);

  const loadTracking = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await shippingService.getGHNTracking(orderId);
      if (response.success) {
        setTrackingData(response.data);
      }
    } catch (err) {
      console.error('Error loading GHN tracking:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      const response = await shippingService.syncGHNStatus(orderId);
      if (response.success) {
        // Reload tracking sau khi sync
        await loadTracking();
      }
    } catch (err) {
      console.error('Error syncing GHN status:', err);
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('delivered') || statusLower.includes('giao hàng')) {
      return <CheckCircle className="status-icon delivered" size={20} />;
    }
    if (statusLower.includes('delivering') || statusLower.includes('đang giao')) {
      return <Truck className="status-icon delivering" size={20} />;
    }
    if (statusLower.includes('picked') || statusLower.includes('lấy hàng')) {
      return <Package className="status-icon picked" size={20} />;
    }
    if (statusLower.includes('fail') || statusLower.includes('thất bại')) {
      return <AlertCircle className="status-icon failed" size={20} />;
    }
    return <Clock className="status-icon pending" size={20} />;
  };

  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('delivered') || statusLower.includes('giao hàng')) {
      return '#4caf50';
    }
    if (statusLower.includes('delivering') || statusLower.includes('đang giao')) {
      return '#2196f3';
    }
    if (statusLower.includes('picked') || statusLower.includes('lấy hàng')) {
      return '#ff9800';
    }
    if (statusLower.includes('fail') || statusLower.includes('thất bại')) {
      return '#f44336';
    }
    return '#9e9e9e';
  };

  if (loading && !trackingData) {
    return (
      <div className="ghn-tracking-container">
        <div className="ghn-loading">
          <div className="spinner"></div>
          <p>Đang tải thông tin vận chuyển...</p>
        </div>
      </div>
    );
  }

  if (error && !trackingData) {
    return (
      <div className="ghn-tracking-container">
        <div className="ghn-error">
          <AlertCircle size={24} />
          <p>{error}</p>
          <button onClick={loadTracking} className="btn-retry">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="ghn-tracking-container">
        <div className="ghn-empty">
          <Package size={24} />
          <p>Đơn hàng chưa có thông tin vận chuyển GHN</p>
        </div>
      </div>
    );
  }

  const { ghnOrderCode, currentStatus, currentStatusText, timeline, expectedDeliveryTime } = trackingData;

  return (
    <div className="ghn-tracking-container">
      <div className="ghn-header">
        <div className="ghn-header-left">
          <Truck size={24} className="ghn-icon" />
          <div>
            <h3>Thông tin vận chuyển GHN</h3>
            <p className="ghn-order-code">Mã vận đơn: <strong>{ghnOrderCode}</strong></p>
          </div>
        </div>
        <button 
          onClick={handleSync} 
          disabled={syncing}
          className="btn-sync"
          title="Cập nhật trạng thái mới nhất"
        >
          <RefreshCw size={16} className={syncing ? 'spinning' : ''} />
          {syncing ? 'Đang cập nhật...' : 'Cập nhật'}
        </button>
      </div>

      <div className="ghn-status-card">
        <div className="ghn-current-status">
          {getStatusIcon(currentStatus)}
          <div className="status-info">
            <span className="status-label">Trạng thái hiện tại:</span>
            <span 
              className="status-text"
              style={{ color: getStatusColor(currentStatus) }}
            >
              {currentStatusText || currentStatus}
            </span>
          </div>
        </div>
        {expectedDeliveryTime && (
          <div className="ghn-expected-time">
            <Clock size={16} />
            <span>Dự kiến giao: {new Date(expectedDeliveryTime).toLocaleDateString('vi-VN')}</span>
          </div>
        )}
      </div>

      {timeline && timeline.length > 0 && (
        <div className="ghn-timeline">
          <h4>Lịch sử vận chuyển</h4>
          <div className="timeline-list">
            {timeline.map((item, index) => (
              <div 
                key={index} 
                className={`timeline-item ${index === 0 ? 'active' : ''}`}
              >
                <div className="timeline-dot" style={{ backgroundColor: getStatusColor(item.status) }}>
                  {getStatusIcon(item.status)}
                </div>
                <div className="timeline-content">
                  <div className="timeline-status">
                    <strong>{item.statusText || item.status}</strong>
                    {item.time && (
                      <span className="timeline-time">
                        {new Date(item.time).toLocaleString('vi-VN')}
                      </span>
                    )}
                  </div>
                  {item.location && (
                    <div className="timeline-location">
                      <MapPin size={14} />
                      <span>{item.location}</span>
                    </div>
                  )}
                  {item.note && (
                    <div className="timeline-note">{item.note}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="ghn-error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default GHNTracking;

