import React from 'react';

/**
 * 🎀 Button Component - Dễ thương với tone màu hồng sữa
 * @param {string} variant - primary | secondary | outline | danger
 * @param {string} size - sm | md | lg
 * @param {boolean} fullWidth - Button chiếm full width
 * @param {boolean} loading - Hiển thị loading spinner
 * @param {ReactNode} children - Nội dung button
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon,
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-cute transition-all duration-300 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-soft hover:shadow-cute hover:-translate-y-1 hover:from-primary-500 hover:to-primary-600',
    secondary: 'bg-white text-primary-600 border-2 border-primary-300 hover:bg-primary-50 hover:border-primary-400 shadow-soft hover:shadow-cute',
    outline: 'bg-transparent border-2 border-primary-300 text-primary-600 hover:bg-primary-50',
    danger: 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-soft hover:shadow-cute hover:-translate-y-1',
    success: 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-soft hover:shadow-cute hover:-translate-y-1',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && !loading && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
