// src/components/PaymentPieChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const PaymentPieChart = ({ data, title = "Tỷ lệ thanh toán" }) => {
  // Màu sắc cho các phương thức thanh toán VÀ trạng thái đơn hàng
  const COLORS = {
    // Phương thức thanh toán
    'VNPay': '#0088FE',
    'Tiền mặt': '#00C49F',
    'COD': '#FFBB28',
    'Chuyển khoản': '#FF8042',
    
    // Trạng thái đơn hàng
    'Chờ xử lý': '#FCD34D', // Vàng
    'Đang giao': '#3B82F6', // Xanh dương
    'Đã giao': '#10B981', // Xanh lá
    'Hoàn thành': '#059669', // Xanh lá đậm
    'Đã hủy': '#EF4444' // Đỏ
  };

  // ✨ Màu dự phòng đa dạng nếu không khớp với key
  const FALLBACK_COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#14B8A6', '#6366F1'];

  // Format số tiền
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Custom label
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
            {payload[0].name}
          </p>
          <p style={{ margin: '0', color: payload[0].payload.fill }}>
            Số đơn: {payload[0].value}
          </p>
          {payload[0].payload.tongTien && (
            <p style={{ margin: '0', color: payload[0].payload.fill }}>
              Tổng tiền: {formatCurrency(payload[0].payload.tongTien)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // ✨ Kiểm tra nếu không có dữ liệu
  if (!data || data.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>{title}</h3>
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          <p style={{ fontSize: '48px', margin: '0' }}>📊</p>
          <p style={{ marginTop: '10px' }}>Không có dữ liệu</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentPieChart;
