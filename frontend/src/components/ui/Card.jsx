import React from 'react';

/**
 * 🎀 Card Component - Card dễ thương với shadow nhẹ
 * @param {boolean} hover - Hiệu ứng hover nâng lên
 * @param {string} padding - sm | md | lg | none
 */
const Card = ({ 
  children, 
  hover = true,
  padding = 'md',
  className = '',
  onClick,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-cute shadow-soft border border-primary-100 transition-all duration-300';
  const hoverClasses = hover ? 'hover:shadow-cute hover:-translate-y-2 cursor-pointer' : '';
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${hoverClasses} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
