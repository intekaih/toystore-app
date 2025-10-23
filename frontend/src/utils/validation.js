/**
 * Validation Utilities
 * Reusable validation functions for form inputs
 */

import { REGEX_PATTERNS, VALIDATION_MESSAGES } from './constants';

/**
 * Kiểm tra email có hợp lệ không
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, message: VALIDATION_MESSAGES.REQUIRED };
  }
  
  if (!REGEX_PATTERNS.EMAIL.test(email)) {
    return { isValid: false, message: VALIDATION_MESSAGES.INVALID_EMAIL };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Kiểm tra số điện thoại Việt Nam
 */
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { isValid: true, message: '' }; // Phone is optional
  }
  
  const cleanPhone = phone.replace(/\s/g, '');
  if (!REGEX_PATTERNS.PHONE_VN.test(cleanPhone)) {
    return { isValid: false, message: VALIDATION_MESSAGES.INVALID_PHONE };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Kiểm tra tên đăng nhập
 */
export const validateUsername = (username) => {
  if (!username || !username.trim()) {
    return { isValid: false, message: VALIDATION_MESSAGES.REQUIRED };
  }
  
  if (username.length < 3) {
    return { isValid: false, message: VALIDATION_MESSAGES.USERNAME_TOO_SHORT };
  }
  
  if (!REGEX_PATTERNS.USERNAME.test(username)) {
    return { isValid: false, message: VALIDATION_MESSAGES.USERNAME_INVALID };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Kiểm tra mật khẩu
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: VALIDATION_MESSAGES.REQUIRED };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: VALIDATION_MESSAGES.PASSWORD_TOO_SHORT };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Kiểm tra mật khẩu nhập lại
 */
export const validatePasswordConfirm = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, message: VALIDATION_MESSAGES.REQUIRED };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: VALIDATION_MESSAGES.PASSWORD_MISMATCH };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Kiểm tra họ tên
 */
export const validateName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, message: VALIDATION_MESSAGES.REQUIRED };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: VALIDATION_MESSAGES.NAME_TOO_SHORT };
  }
  
  if (!REGEX_PATTERNS.NAME_VN.test(name.trim())) {
    return { isValid: false, message: VALIDATION_MESSAGES.NAME_INVALID };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Kiểm tra trường bắt buộc
 */
export const validateRequired = (value, fieldName = 'Trường này') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { isValid: false, message: `${fieldName} không được để trống` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Kiểm tra độ dài tối thiểu
 */
export const validateMinLength = (value, minLength, fieldName = 'Trường này') => {
  if (!value || value.length < minLength) {
    return { 
      isValid: false, 
      message: `${fieldName} phải có ít nhất ${minLength} ký tự` 
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Kiểm tra độ dài tối đa
 */
export const validateMaxLength = (value, maxLength, fieldName = 'Trường này') => {
  if (value && value.length > maxLength) {
    return { 
      isValid: false, 
      message: `${fieldName} không được vượt quá ${maxLength} ký tự` 
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Kiểm tra số
 */
export const validateNumber = (value, fieldName = 'Trường này') => {
  if (value && isNaN(value)) {
    return { isValid: false, message: `${fieldName} phải là số` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Kiểm tra số dương
 */
export const validatePositiveNumber = (value, fieldName = 'Trường này') => {
  const numberCheck = validateNumber(value, fieldName);
  if (!numberCheck.isValid) return numberCheck;
  
  if (value && Number(value) <= 0) {
    return { isValid: false, message: `${fieldName} phải là số dương` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate toàn bộ form
 * @param {Object} data - Dữ liệu form
 * @param {Object} rules - Các quy tắc validation
 * @returns {Object} - { isValid, errors }
 */
export const validateForm = (data, rules) => {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = data[field];

    if (rule.required) {
      const result = validateRequired(value, rule.label || field);
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
        return;
      }
    }

    if (rule.type === 'email') {
      const result = validateEmail(value);
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
      }
    }

    if (rule.type === 'phone') {
      const result = validatePhone(value);
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
      }
    }

    if (rule.type === 'username') {
      const result = validateUsername(value);
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
      }
    }

    if (rule.type === 'password') {
      const result = validatePassword(value);
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
      }
    }

    if (rule.type === 'name') {
      const result = validateName(value);
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
      }
    }

    if (rule.minLength) {
      const result = validateMinLength(value, rule.minLength, rule.label || field);
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
      }
    }

    if (rule.maxLength) {
      const result = validateMaxLength(value, rule.maxLength, rule.label || field);
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};

export default {
  validateEmail,
  validatePhone,
  validateUsername,
  validatePassword,
  validatePasswordConfirm,
  validateName,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateNumber,
  validatePositiveNumber,
  validateForm,
};
