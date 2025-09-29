import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../../api/productApi';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await getProductById(id);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-detail">
      <Link to="/products" className="back-button">
        ← Back to Products
      </Link>
      
      <div className="product-detail-content">
        <div className="product-image-container">
          <img 
            src={product.hinhAnhURL || '/placeholder.jpg'} 
            alt={product.ten}
            className="product-image"
          />
        </div>

        <div className="product-info">
          <h1>{product.ten}</h1>
          <p className="price">{product.giaBan.toLocaleString('vi-VN')} ₫</p>
          <p className="stock">Số lượng trong kho: {product.ton}</p>
          <div className="product-description">
            <h3>Mô tả sản phẩm:</h3>
            <p>{product.moTa}</p>
          </div>
          {product.loaiSP && (
            <p>Loại: {product.loaiSP.ten}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;