import React from 'react';

/**
 * 💝 Input Component - Input field dễ thương
 */
const Input = ({ 
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  icon,
  className = '',
  ...props 
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`input-cute ${icon ? 'pl-12' : ''} ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
};

export default Input;
