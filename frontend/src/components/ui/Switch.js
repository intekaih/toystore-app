import React from 'react';

/**
 * 🎀 Switch Component - Toggle dễ thương tone hồng sữa
 */
const Switch = ({ 
  checked = false, 
  onChange, 
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <label className={`inline-flex items-center cursor-pointer gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className={`
          w-11 h-6 bg-gray-200 rounded-full peer
          peer-checked:bg-gradient-to-r peer-checked:from-pink-400 peer-checked:to-rose-400
          peer-focus:ring-3 peer-focus:ring-pink-200
          transition-all duration-300 shadow-sm
        `}></div>
        <div className={`
          absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full
          peer-checked:translate-x-5
          transition-transform duration-300 shadow-md
          flex items-center justify-center text-[10px]
        `}>
          {checked ? '✓' : ''}
        </div>
      </div>
      {label && (
        <span className="text-sm font-medium text-gray-700 select-none whitespace-nowrap">
          {label}
        </span>
      )}
    </label>
  );
};

export default Switch;
