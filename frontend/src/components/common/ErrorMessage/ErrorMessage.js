/**
 * ErrorMessage Component
 * Reusable error message display
 */

import React from 'react';
import styles from './ErrorMessage.module.css';

const ErrorMessage = ({
  message,
  type = 'error',
  onClose,
  showIcon = true,
  className = '',
}) => {
  if (!message) return null;

  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅',
  };

  return (
    <div className={`${styles.message} ${styles[type]} ${className}`}>
      {showIcon && <span className={styles.icon}>{icons[type]}</span>}
      <span className={styles.text}>{message}</span>
      {onClose && (
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Đóng"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
