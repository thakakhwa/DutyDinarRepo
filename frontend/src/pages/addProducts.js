import React, { useState, useEffect, useRef } from 'react';
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
    imageUrl: '',
    category: 0  // initialize as 0
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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

  const handleCategoryChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setFormData({
      ...formData,
      category: val
    });
  };

  // New handler for drag and drop image
  const handleDrop = (e) => {
    e.preventDefault();
    setError('');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          imageUrl: reader.result // base64 string
        });
        console.log('Image dropped and converted to base64');
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please drop a valid image file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // New handler for file input change (button upload)
  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          imageUrl: reader.result // base64 string
        });
        console.log('Image selected and converted to base64');
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please select a valid image file.');
    }
  };

  // Handler to trigger file input click
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      console.log('File input clicked');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Form submit triggered');

    if (formData.category === 0) {
      setError('Please select a valid category.');
      console.log('Invalid category selected');
      return;
    }

    if (!formData.imageUrl) {
      setError('Please upload an image.');
      console.log('No image uploaded');
      return;
    }

    setLoading(true);

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      minOrderQuantity: parseInt(formData.minOrderQuantity),
      image_url: formData.imageUrl,
      categories: [formData.category]  // send as array for backend compatibility
    };

    console.log('Sending product data:', productData);

    try {
      const response = await axios.post(`${API_BASE_URL}/add_products.php`, productData, {
        withCredentials: true
      });

      console.log('Response from backend:', response.data);

      if (response.data.success) {
        alert('Product added successfully');
        navigate('/seller-dashboard');
      } else {
        setError(response.data.message || 'Failed to add product');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Network error';
      setError(errorMessage);
      console.error('Error during product add:', errorMessage);
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
            <label className="text-lg font-semibold">Product Image (Drag and Drop or Select)</label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="w-full h-40 border-4 border-dashed border-gray-400 rounded-lg flex items-center justify-center cursor-pointer bg-white mb-2"
            >
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-gray-500">Drag and drop an image here</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleButtonClick}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Select Image
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            >
              <option value={0} disabled>Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
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
