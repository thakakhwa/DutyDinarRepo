import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../api/get_categories';
import axios from "axios";

const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api";

const AddProducts = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    minOrderQuantity: '',
    imageUrl: ''
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getCategories();
        if (result.success) {
          setCategories(result.categories);
        } else {
          setError(result.message || 'Failed to load categories');
        }
      } catch (err) {
        console.error('Category fetch error:', err);
        setError('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      minOrderQuantity: parseInt(formData.minOrderQuantity),
      image_url: formData.imageUrl,
      categories: selectedCategories
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/add_products.php`, productData, {
        withCredentials: true
      });

      if (response.data.success) {
        alert('Product added successfully');
        navigate('/seller-dashboard');
      } else {
        setError(response.data.message || 'Failed to add product');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Network error';
      console.error('Submission error:', err.response || err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Add New Product</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          {/* Form Fields */}
          <div className="space-y-2">
            <label className="text-lg font-semibold">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Price</label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Stock Quantity</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Minimum Order Quantity</label>
            <input
              type="number"
              name="minOrderQuantity"
              value={formData.minOrderQuantity}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Image URL</label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Categories</label>
            <select 
              multiple
              value={selectedCategories}
              onChange={(e) => setSelectedCategories(
                Array.from(e.target.selectedOptions, option => option.value)
              )}
              className="w-full border border-gray-300 p-2 rounded-lg h-32"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500">
              {categories.length === 0 
                ? 'No categories available' 
                : 'Hold CTRL/CMD to select multiple categories'}
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg mt-4 hover:bg-green-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProducts;