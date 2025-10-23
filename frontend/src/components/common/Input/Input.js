/**
 * Input Component
 * Reusable input field with validation support
 */

import React, { useState } from 'react';
import styles from './Input.module.css';

const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  error,
  touched,
  disabled = false,
  required = false,
  icon,
  showPasswordToggle = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;
  const showError = touched && error;

  return (
    <div className={`${styles.inputGroup} ${className}`}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        {icon && <span className={styles.icon}>{icon}</span>}
        
        <input
          id={name}
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            ${styles.input}
            ${icon ? styles.withIcon : ''}
            ${showError ? styles.error : ''}
            ${disabled ? styles.disabled : ''}
          `}
          {...props}
        />
        
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>
      
      {showError && (
        <span className={styles.errorMessage}>{error}</span>
      )}
    </div>
  );
};

export default Input;
