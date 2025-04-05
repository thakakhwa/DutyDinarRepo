import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../api/get_categories';
import axios from "axios";

const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api";

const AddProducts = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [minOrderQuantity, setMinOrderQuantity] = useState('');
  const [imageUrl, setImageUrl] = useState('');
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
          setCategories([]);
        }
      } catch (err) {
        console.error('Category fetch error:', err);
        setError('Failed to load categories');
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const productData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      minOrderQuantity: parseInt(minOrderQuantity),
      image_url: imageUrl,
      categories: selectedCategories
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/add_product.php`, productData);
      
      if (response.data.success) {
        alert('Product added successfully');
        navigate('/seller-dashboard');
      } else {
        setError(response.data.message || 'Failed to add product');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Add New Product</h2>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="space-y-2">
            <label className="text-lg font-semibold">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Price</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Stock Quantity</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Minimum Order Quantity</label>
            <input
              type="number"
              value={minOrderQuantity}
              onChange={(e) => setMinOrderQuantity(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
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
              {categories.length === 0 ? 'No categories available' : 'Hold CTRL/CMD to select multiple'}
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