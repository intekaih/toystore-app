import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Sparkles, TrendingUp, Coins } from 'lucide-react';
import { productService } from '../services';
import './LeaderboardBanner.css';

const LeaderboardBanner = () => {
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopCustomers();
  }, []);

  const loadTopCustomers = async () => {
    try {
      const response = await productService.getTopCustomers();
      if (response.success && response.data) {
        const customers = response.data.customers || [];
        console.log('🏆 Top customers loaded:', customers.length, customers);
        setTopCustomers(customers);
      }
    } catch (error) {
      console.error('Error loading top customers:', error);
      setTopCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  };

  const getRankIcon = (rank) => {
    const iconProps = { className: "w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8", fill: "currentColor" };
    switch (rank) {
      case 1: return <Crown {...iconProps} className={`${iconProps.className} text-yellow-400`} />;
      case 2: return <Medal {...iconProps} className={`${iconProps.className} text-gray-300`} />;
      case 3: return <Medal {...iconProps} className={`${iconProps.className} text-amber-600`} />;
      default: return <Trophy {...iconProps} className={`${iconProps.className} text-gray-500`} />;
    }
  };

  const getRankGradient = (rank) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-br from-yellow-400 to-amber-500';
      case 2: return 'bg-gradient-to-br from-gray-300 to-gray-400';
      case 3: return 'bg-gradient-to-br from-amber-600 to-orange-700';
      default: return 'bg-gradient-to-br from-gray-200 to-gray-300';
    }
  };

  const getRankGlow = (rank) => {
    switch (rank) {
      case 1: return 'shadow-glow-gold';
      case 2: return 'shadow-glow-silver';
      case 3: return 'shadow-glow-bronze';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="leaderboard-banner-container h-full flex items-center justify-center">
        <div className="relative bg-gradient-to-br from-primary-50 via-rose-50 to-cream-100 rounded-cute p-4 md:p-6 overflow-hidden w-full h-full flex flex-col justify-center animate-pulse">
          <div className="absolute top-4 right-4 text-6xl opacity-10"><Trophy /></div>
          <div className="absolute bottom-4 left-4 text-5xl opacity-10" style={{ animationDelay: '0.5s' }}><Crown /></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl opacity-5"><Sparkles /></div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-800 text-center mb-4">Đang tải bảng xếp hạng...</h2>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Nếu không có khách hàng, hiển thị placeholder
  const displayCustomers = topCustomers.length > 0 
    ? topCustomers 
    : [
        { rank: 1, hoTen: 'Chưa có', soDonHang: 0, tongChiTieu: 0, id: 'placeholder-1' },
        { rank: 2, hoTen: 'Chưa có', soDonHang: 0, tongChiTieu: 0, id: 'placeholder-2' },
        { rank: 3, hoTen: 'Chưa có', soDonHang: 0, tongChiTieu: 0, id: 'placeholder-3' }
      ];

  return (
    <div className="leaderboard-banner-container h-full flex items-center">
      <div className="relative bg-gradient-to-br from-primary-50 via-rose-50 to-cream-100 rounded-cute p-4 md:p-6 overflow-hidden w-full h-full flex flex-col">
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 text-6xl opacity-10 animate-float">
          <Trophy />
        </div>
        <div className="absolute bottom-4 left-4 text-5xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>
          <Crown />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl opacity-5">
          <Sparkles />
        </div>

        {/* Header */}
        <div className="relative z-10 text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-primary-600" fill="currentColor" />
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-800">
              BẢNG XẾP HẠNG VIP
            </h2>
            <Trophy className="w-8 h-8 text-primary-600" fill="currentColor" />
          </div>
          <p className="text-gray-600 text-sm md:text-base">
            Top 3 khách hàng mua nhiều nhất tháng này
          </p>
        </div>

        {/* Leaderboard - Podium Layout: #2 (left, 2nd highest), #1 (center, highest), #3 (right, lowest) */}
        <div className="relative z-10 flex items-end justify-center gap-2 md:gap-4 lg:gap-6 flex-1 mt-auto mb-2">
          {(() => {
            // Đảm bảo #1 luôn ở giữa: Sắp xếp theo thứ tự [2, 1, 3]
            const customers = displayCustomers.slice(0, 3);
            const rank2 = customers.find(c => c.rank === 2);
            const rank1 = customers.find(c => c.rank === 1);
            const rank3 = customers.find(c => c.rank === 3);
            
            // Tạo mảng với thứ tự cố định: #2 (trái), #1 (giữa), #3 (phải)
            const ordered = [];
            if (rank2) ordered.push(rank2);
            if (rank1) ordered.push(rank1); // #1 luôn ở giữa
            if (rank3) ordered.push(rank3);
            
            return ordered.map((customer) => {
              const isFirst = customer.rank === 1;
              const isSecond = customer.rank === 2;
              const isThird = customer.rank === 3;

              // Chiều cao podium: #1 = 80% (cao nhất), #2 = 70% (cao nhì), #3 = 60% (thấp nhất)
              const podiumHeight = isFirst ? '80%' : isSecond ? '70%' : '60%';

              return (
                <div
                  key={customer.id}
                  className={`relative bg-white rounded-cute transform transition-all duration-300 hover:scale-105 flex flex-col ${
                    isFirst ? 'z-20' : isSecond ? 'z-15' : 'z-10'
                  } ${getRankGlow(customer.rank)}`}
                  style={{
                    height: podiumHeight,
                    flex: isFirst ? '1.15' : isSecond ? '1.05' : '1', // #1 rộng nhất, #2 rộng hơn #3
                    minHeight: isFirst ? '240px' : isSecond ? '210px' : '180px',
                    maxHeight: isFirst ? '280px' : isSecond ? '250px' : '220px',
                    padding: isFirst ? '26px 24px' : isSecond ? '24px 22px' : '22px 20px', // Padding khác nhau: Top 1 lớn nhất
                    paddingBottom: '20px', // Padding bottom cố định để dòng số tiền cùng vị trí Y
                  }}
                >
                  {/* Rank Badge */}
                  <div className={`absolute -top-2 md:-top-3 lg:-top-4 left-1/2 -translate-x-1/2 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br ${getRankGradient(customer.rank)} flex items-center justify-center ${getRankGlow(customer.rank)} border-2 md:border-3 lg:border-4 border-white shadow-lg`}>
                    <span className="text-white font-black text-sm md:text-base lg:text-xl drop-shadow-md">{customer.rank}</span>
                  </div>

                  {/* Rank Icon */}
                  <div className={`flex justify-center ${
                    isFirst ? 'mb-2 mt-8' : isSecond ? 'mb-1.5 mt-6' : 'mb-1 mt-4'
                  }`}>
                    {getRankIcon(customer.rank)}
                  </div>

                  {/* Customer Info - flex-grow để đẩy phần dưới xuống */}
                  <div className="flex-grow flex flex-col justify-end">
                    <div className="text-center">
                      {/* Tên khách hàng */}
                      <h3 
                        className={`font-black tracking-wide truncate px-1 ${
                          isFirst 
                            ? 'text-sm md:text-base lg:text-lg xl:text-xl' 
                            : isSecond
                              ? 'text-xs md:text-sm lg:text-base'
                              : 'text-xs md:text-sm'
                        } ${
                          (String(customer.id || '').includes('placeholder') || customer.hoTen === 'Chưa có') 
                            ? 'text-gray-400' 
                            : isFirst 
                              ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent drop-shadow-sm' 
                              : 'text-gray-800 font-extrabold'
                        }`}
                        style={{
                          marginBottom: isFirst ? '12px' : isSecond ? '8px' : '6px'
                        }}
                      >
                        {customer.hoTen}
                      </h3>
                      
                      {/* Stats - chỉ hiển thị nếu có dữ liệu thật */}
                      {!String(customer.id || '').includes('placeholder') && customer.hoTen !== 'Chưa có' && customer.tongChiTieu > 0 && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: isFirst ? '6px' : isSecond ? '4px' : '2px'
                        }}>
                          {/* Dòng số đơn */}
                          <div 
                            className={`flex items-center justify-center gap-1 md:gap-1.5 ${
                              isFirst ? 'text-xs md:text-sm' : isSecond ? 'text-xs' : 'text-xs'
                            } text-gray-700 font-semibold`}
                            style={{
                              marginBottom: isFirst ? '6px' : isSecond ? '4px' : '2px'
                            }}
                          >
                            <TrendingUp className={`${
                              isFirst ? 'w-3.5 h-3.5 md:w-4 md:h-4' 
                              : isSecond ? 'w-3 h-3 md:w-3.5 md:h-3.5' 
                              : 'w-3 h-3'
                            } text-primary-500`} />
                            <span className="tracking-tight">{customer.soDonHang} đơn</span>
                          </div>
                          
                          {/* Dòng số tiền - CỐ ĐỊNH VỊ TRÍ Y (cùng padding-bottom) */}
                          <div className="flex items-center justify-center gap-1 md:gap-1.5">
                            <Coins className={`${
                              isFirst ? 'w-3.5 h-3.5 md:w-4 md:h-4' 
                              : isSecond ? 'w-3 h-3 md:w-3.5 md:h-3.5' 
                              : 'w-3 h-3'
                            } text-yellow-500`} fill="currentColor" strokeWidth={2} />
                            <span className={`font-black tracking-tight ${
                              isFirst 
                                ? 'bg-gradient-to-r from-primary-600 via-rose-500 to-primary-600 bg-clip-text text-transparent text-sm md:text-base lg:text-lg drop-shadow-sm' 
                                : isSecond
                                  ? 'text-primary-600 text-xs md:text-sm lg:text-base'
                                  : 'text-primary-600 text-xs md:text-sm'
                            }`}>
                              {formatPrice(customer.tongChiTieu)}₫
                            </span>
                          </div>
                        </div>
                      )}
                      {(String(customer.id || '').includes('placeholder') || customer.hoTen === 'Chưa có') && (
                        <div 
                          className="text-xs text-gray-400 font-medium"
                          style={{
                            marginTop: isFirst ? '8px' : isSecond ? '6px' : '4px'
                          }}
                        >
                          Chưa có dữ liệu
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special effects for #1 */}
                  {isFirst && (
                    <>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-yellow-300 rounded-full animate-pulse"></div>
                    </>
                  )}
                </div>
              );
            });
          })()}
        </div>

        {/* Call to action */}
        <div className="relative z-10 text-center mt-3 md:mt-4 lg:mt-6 pt-2 md:pt-3 lg:pt-4 border-t-2 border-primary-200">
          <p className="text-gray-700 text-xs md:text-sm lg:text-base font-medium">
            💎 Bạn muốn có tên trên bảng này? Hãy mua sắm ngay!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardBanner;

