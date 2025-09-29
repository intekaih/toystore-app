// src/api/productApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getProducts = async (page = 1, search = '') => {
  try {
    const response = await axios.get(`${API_URL}/products`, {
      params: { 
        page, 
        limit: 10, 
        search 
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};