import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import '../styles/AutocompleteInput.css';

/**
 * AutocompleteInput - Component tìm kiếm và tự động hoàn thành
 * Cho phép người dùng nhập tên, tự động tìm kiếm và chọn từ danh sách
 */
const AutocompleteInput = ({
  label,
  value,
  onChange,
  onSelect,
  searchFunction,
  placeholder,
  required = false,
  error = '',
  disabled = false,
  displayKey = 'ten',
  valueKey = 'id',
  createText = 'Tạo mới',
  minChars = 0
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cập nhật input value khi value prop thay đổi
  useEffect(() => {
    if (value && typeof value === 'object') {
      setInputValue(value[displayKey] || '');
      setSelectedId(value[valueKey]);
    } else if (value) {
      setInputValue(value);
    } else {
      setInputValue('');
      setSelectedId(null);
    }
  }, [value, displayKey, valueKey]);

  // Tìm kiếm với debounce
  const handleInputChange = async (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedId(null);

    // Gọi onChange để parent component biết
    if (onChange) {
      onChange(newValue);
    }

    // Clear debounce cũ
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Nếu input rỗng hoặc quá ngắn
    if (!newValue.trim() || newValue.trim().length < minChars) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce search
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchFunction(newValue.trim());
        setSuggestions(results || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('❌ Lỗi tìm kiếm:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  // Chọn một suggestion
  const handleSelectSuggestion = (item) => {
    setInputValue(item[displayKey]);
    setSelectedId(item[valueKey]);
    setShowSuggestions(false);
    
    if (onSelect) {
      onSelect(item);
    }
  };

  // Tạo mới khi không tìm thấy
  const handleCreateNew = () => {
    setShowSuggestions(false);
    
    if (onSelect) {
      onSelect({
        [displayKey]: inputValue,
        [valueKey]: null,
        isNew: true
      });
    }
  };

  // Focus vào input sẽ hiện suggestions nếu có
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      {label && (
        <label className="autocomplete-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      
      <div className="autocomplete-input-container">
        <input
          type="text"
          className={`autocomplete-input ${error ? 'error' : ''} ${selectedId ? 'selected' : ''}`}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
        />
        
        {loading && (
          <div className="autocomplete-spinner">⏳</div>
        )}
        
        {selectedId && (
          <div className="autocomplete-check">✓</div>
        )}
      </div>

      {error && <span className="error-message">{error}</span>}

      {showSuggestions && (
        <div className="autocomplete-dropdown">
          {suggestions.length > 0 ? (
            <>
              {suggestions.map((item) => (
                <div
                  key={item[valueKey]}
                  className="autocomplete-item"
                  onClick={() => handleSelectSuggestion(item)}
                >
                  {item[displayKey]}
                </div>
              ))}
            </>
          ) : (
            !loading && inputValue.trim() && (
              <div
                className="autocomplete-item create-new"
                onClick={handleCreateNew}
              >
                <Plus size={16} className="text-pink-500" />
                {createText}: "<strong>{inputValue}</strong>"
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
