import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../api/productApi';
import Pagination from '../../components/Pagination';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts(currentPage, searchTerm);
      
      // API trả về cấu trúc: response.data.products
      if (response.data && response.data.products) {
        setProducts(response.data.products);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  // DEBUG: Hiển thị số lượng sản phẩm
  console.log('Current products state:', products);

  return (
    <div className="products-page">
      <h1>Danh sách sản phẩm</h1>
      <p>Tìm thấy {products.length} sản phẩm</p>
      
      <div className="search-box">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="products-grid">
        {products.length > 0 ? (
          products.map((product, index) => (
            <div 
              key={product.id} 
              className="product-card"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="product-image-wrapper">
                <img 
                  src={product.hinhAnh || '/placeholder.jpg'} 
                  alt={product.tenSP || 'Product'} 
                />
              </div>
              <div className="product-info">
                <h3>{product.tenSP}</h3>
                <p className="price">
                  {product.giaBan?.toLocaleString('vi-VN')} ₫
                </p>
                <p className="stock">Còn: {product.soLuongTon}</p>
                <p className="category">{product.loaiSP?.tenLoai}</p>
              </div>
            </div>
          ))
        ) : (
          <p>Không có sản phẩm nào</p>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ProductList;