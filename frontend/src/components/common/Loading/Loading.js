/**
 * Loading Component
 * Reusable loading indicator with different variants
 */

import React from 'react';
import styles from './Loading.module.css';

const Loading = ({
  variant = 'spinner',
  size = 'medium',
  fullScreen = false,
  text = 'Đang tải...',
  showText = true,
  className = '',
}) => {
  if (fullScreen) {
    return (
      <div className={styles.fullScreenOverlay}>
        <div className={styles.fullScreenContent}>
          <div className={`${styles[variant]} ${styles[size]}`}></div>
          {showText && <p className={styles.text}>{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={`${styles[variant]} ${styles[size]}`}></div>
      {showText && <p className={styles.text}>{text}</p>}
    </div>
  );
};

export default Loading;
