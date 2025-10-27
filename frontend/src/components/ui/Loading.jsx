import React from 'react';

/**
 * 🎀 Loading Component - Spinner dễ thương
 */
const Loading = ({ 
  size = 'md',
  text = 'Đang tải...',
  fullScreen = false,
  className = '',
}) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`spinner-cute ${sizes[size]}`}></div>
      {text && (
        <p className="text-primary-500 font-semibold animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      {spinner}
    </div>
  );
};

export default Loading;
