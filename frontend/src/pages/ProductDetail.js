import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    API.get(`/products/${id}`).then(res => setProduct(res.data));
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <div>
      <h2>{product.tenSP}</h2>
      <p>{product.moTa}</p>
      <p>Giá: {product.gia} VND</p>
      <p>Tồn kho: {product.soLuong}</p>
    </div>
  );
}
export default ProductDetail;
