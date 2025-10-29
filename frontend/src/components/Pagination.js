import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center gap-3">
      {/* Nút Previous - Icon mũi tên trái */}
      <button 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`
          flex items-center justify-center w-10 h-10 rounded-xl
          border-2 transition-all duration-200 font-semibold
          ${currentPage === 1 
            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
            : 'bg-white border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300 hover:shadow-md cursor-pointer'
          }
        `}
        title="Trang trước"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* Hiển thị số trang */}
      <span className="px-4 py-2 bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200 rounded-xl text-gray-700 font-semibold min-w-[100px] text-center">
        {currentPage} / {totalPages}
      </span>
      
      {/* Nút Next - Icon mũi tên phải */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={`
          flex items-center justify-center w-10 h-10 rounded-xl
          border-2 transition-all duration-200 font-semibold
          ${currentPage === totalPages
            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
            : 'bg-white border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300 hover:shadow-md cursor-pointer'
          }
        `}
        title="Trang tiếp"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;