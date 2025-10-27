/**
 * 🎯 ProductFilterBar Component - Tone màu hồng sữa
 * Component cung cấp UI để lọc và sắp xếp sản phẩm
 */

import React, { useState } from 'react';
import { getAvailableFilters } from '../api/productApi';
import { ChevronDown, ChevronUp, X, Sparkles } from 'lucide-react';
import { Button, Badge } from './ui';

const ProductFilterBar = ({ onFilterChange, currentFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const availableFilters = getAvailableFilters();

  const handleFilterChange = (filterType, value) => {
    onFilterChange({
      ...currentFilters,
      [filterType]: value,
      page: 1
    });
  };

  const handlePriceChange = (type, value) => {
    const numValue = value === '' ? null : parseFloat(value);
    handleFilterChange(type, numValue);
  };

  const clearFilters = () => {
    onFilterChange({
      page: 1,
      limit: 10,
      search: '',
      filter: 'newest',
      minPrice: null,
      maxPrice: null,
      categoryId: null
    });
  };

  const hasActiveFilters = 
    currentFilters.minPrice || 
    currentFilters.maxPrice || 
    currentFilters.categoryId ||
    currentFilters.search;

  const activeFiltersCount = [
    currentFilters.minPrice, 
    currentFilters.maxPrice, 
    currentFilters.categoryId
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* 🎯 Thanh Filter chính */}
      <div className="bg-white rounded-cute shadow-soft border-2 border-primary-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Strategy Selector */}
          <div className="flex-1">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Sparkles size={16} className="text-primary-500" />
              <span>Sắp xếp theo:</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableFilters.map(filter => (
                <button
                  key={filter.value}
                  className={`px-4 py-2 rounded-cute text-sm font-semibold transition-all ${
                    currentFilters.filter === filter.value
                      ? 'bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-soft'
                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  }`}
                  onClick={() => handleFilterChange('filter', filter.value)}
                  title={filter.label}
                >
                  <span className="mr-1">{filter.icon}</span>
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Advanced Filters */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-cute font-semibold transition-all border-2 border-primary-200 relative"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            <span>{isExpanded ? 'Ẩn bộ lọc' : 'Bộ lọc nâng cao'}</span>
            {hasActiveFilters && (
              <Badge variant="danger" size="sm" className="absolute -top-2 -right-2">
                {activeFiltersCount}
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* 🔽 Advanced Filters - Collapsed */}
      {isExpanded && (
        <div className="bg-white rounded-cute shadow-soft border-2 border-primary-100 p-6 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lọc theo giá */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <span className="text-lg">💰</span>
                <span>Khoảng giá</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Từ (₫)"
                  value={currentFilters.minPrice || ''}
                  onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                  className="input-cute text-sm"
                  min="0"
                />
                <span className="text-gray-400 font-semibold">—</span>
                <input
                  type="number"
                  placeholder="Đến (₫)"
                  value={currentFilters.maxPrice || ''}
                  onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                  className="input-cute text-sm"
                  min="0"
                />
              </div>
            </div>

            {/* Quick price filters */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <span className="text-lg">⚡</span>
                <span>Lọc nhanh</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => {
                    handleFilterChange('minPrice', null);
                    handleFilterChange('maxPrice', 100000);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-cute text-sm font-semibold hover:shadow-soft transition-all"
                >
                  &lt; 100k
                </button>
                <button 
                  onClick={() => {
                    handleFilterChange('minPrice', 100000);
                    handleFilterChange('maxPrice', 500000);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-cute text-sm font-semibold hover:shadow-soft transition-all"
                >
                  100k - 500k
                </button>
                <button 
                  onClick={() => {
                    handleFilterChange('minPrice', 500000);
                    handleFilterChange('maxPrice', null);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-cute text-sm font-semibold hover:shadow-soft transition-all"
                >
                  &gt; 500k
                </button>
              </div>
            </div>
          </div>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <div className="mt-6 pt-4 border-t-2 border-primary-100">
              <Button 
                variant="outline"
                onClick={clearFilters}
                icon={<X size={18} />}
              >
                Xóa tất cả bộ lọc
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 🏷️ Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 bg-gradient-to-r from-primary-50 to-rose-50 rounded-cute p-4 border-2 border-primary-200 animate-slide-up">
          <span className="text-sm font-semibold text-gray-700">Đang lọc:</span>
          {currentFilters.minPrice && (
            <Badge variant="primary" className="flex items-center gap-2">
              Từ {currentFilters.minPrice.toLocaleString()}₫
              <button onClick={() => handleFilterChange('minPrice', null)} className="hover:text-red-500">
                <X size={14} />
              </button>
            </Badge>
          )}
          {currentFilters.maxPrice && (
            <Badge variant="primary" className="flex items-center gap-2">
              Đến {currentFilters.maxPrice.toLocaleString()}₫
              <button onClick={() => handleFilterChange('maxPrice', null)} className="hover:text-red-500">
                <X size={14} />
              </button>
            </Badge>
          )}
          {currentFilters.search && (
            <Badge variant="info" className="flex items-center gap-2">
              Tìm: "{currentFilters.search}"
              <button onClick={() => handleFilterChange('search', '')} className="hover:text-red-500">
                <X size={14} />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductFilterBar;
