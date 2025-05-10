import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { updateProduct } from '../api/update_products';
import { AuthContext } from '../context/AuthContext';
import { getCategories } from '../api/get_categories';

const EditProductPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [productData, setProductData] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    stock: '',
    minOrderQuantity: 1,
    categories: [],
    image_url: ''
  });
  const [previewImage, setPreviewImage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [originalImageUrl, setOriginalImageUrl] = useState('');

  useEffect(() => {
    // Check authentication
    if (!user || user.userType !== 'seller') {
      navigate('/login');
      return;
    }

    // Check if we have product data
    if (!location.state || !location.state.product) {
      navigate('/inventory');
      return;
    }

    const product = location.state.product;
    console.log("Product data from location state:", product);
    
    // Store the original image URL, but only if it's valid
    const imageUrl = product.image_url && product.image_url !== '0' ? product.image_url : '';
    console.log("Setting original image URL:", imageUrl);
    setOriginalImageUrl(imageUrl);

    // Load categories and set product data
    const initializeData = async () => {
      try {
        // Load categories
        const response = await getCategories();
        console.log("Categories response:", response);
        
        // Get categories array from response
        let categoriesArray = [];
        if (response.categories && Array.isArray(response.categories)) {
          categoriesArray = response.categories;
        } else if (response.data && response.data.categories && Array.isArray(response.data.categories)) {
          categoriesArray = response.data.categories;
        }
        
        console.log("Processed categories array:", categoriesArray);
        
        if (categoriesArray.length > 0) {
          setCategories(categoriesArray);
          
          // Find category ID from category name
          let categoryId = 1; // Default category ID
          const matchingCategory = categoriesArray.find(
            cat => cat.name && product.category && 
                  cat.name.toLowerCase() === product.category.toLowerCase()
          );
          
          if (matchingCategory) {
            categoryId = matchingCategory.id;
          }
          
          console.log("Found category ID:", categoryId, "for category:", product.category);
          
          // Set product data
          setProductData({
            id: product.id,
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            stock: product.stock || '',
            minOrderQuantity: product.minOrderQuantity || 1,
            categories: [categoryId],
            image_url: imageUrl // Use the same imageUrl we stored in originalImageUrl
          });
          
          // Set preview image only if image_url is valid
          if (imageUrl) {
            const previewUrl = imageUrl.startsWith('data:') 
              ? imageUrl 
              : `${process.env.REACT_APP_API_URL || ''}/${imageUrl}`;
            console.log("Setting preview image URL:", previewUrl);
            setPreviewImage(previewUrl);
          }
        } else {
          console.error("No categories found in response:", response);
          setErrorMessage("Failed to load categories. Please try again.");
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        setErrorMessage('Failed to load necessary data. Please try again.');
      }
    };

    initializeData();
  }, [user, navigate, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value);
    setProductData(prev => ({ ...prev, categories: [categoryId] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // Validate form
      if (!productData.name || !productData.description || !productData.price || !productData.stock || !productData.categories.length) {
        setErrorMessage('All fields except image are required');
        setLoading(false);
        return;
      }

      // Ensure price is a valid number
      const price = parseFloat(productData.price);
      if (isNaN(price) || price <= 0) {
        setErrorMessage('Price must be a valid positive number');
        setLoading(false);
        return;
      }

      // Ensure stock is a valid integer
      const stock = parseInt(productData.stock);
      if (isNaN(stock) || stock < 0) {
        setErrorMessage('Stock must be a valid non-negative integer');
        setLoading(false);
        return;
      }

      // Debug log to check the originalImageUrl value
      console.log("Original Image URL before submit:", originalImageUrl);
      console.log("Type of originalImageUrl:", typeof originalImageUrl);
      
      // Prepare the data for submission
      const dataToSubmit = {
        ...productData,
        price: price,
        stock: stock,
        minOrderQuantity: parseInt(productData.minOrderQuantity) || 1,
        // Always use the original image URL
        image_url: originalImageUrl
      };

      // Ensure image_url is not empty or '0'
      if (!dataToSubmit.image_url || dataToSubmit.image_url === '0') {
        console.error("Warning: image_url is empty or '0'. Using original URL:", originalImageUrl);
        // Force the original URL if it exists
        if (originalImageUrl && originalImageUrl !== '0') {
          dataToSubmit.image_url = originalImageUrl;
        }
      }

      console.log("Submitting product data with image_url:", dataToSubmit.image_url);
      const result = await updateProduct(dataToSubmit);
      console.log("Update result:", result);
      
      if (result.success) {
        navigate('/inventory');
      } else {
        setErrorMessage(result.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setErrorMessage('An unexpected error occurred: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1">Product Name</label>
          <input
            type="text"
            name="name"
            value={productData.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            rows="4"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Price ($)</label>
            <input
              type="number"
              name="price"
              value={productData.price}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1">Stock</label>
            <input
              type="number"
              name="stock"
              value={productData.stock}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Minimum Order Quantity</label>
            <input
              type="number"
              name="minOrderQuantity"
              value={productData.minOrderQuantity}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="1"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1">Category</label>
            <select
              name="category"
              value={productData.categories[0] || ''}
              onChange={handleCategoryChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Display product image if available, but don't allow changing it */}
        {previewImage && (
          <div>
            <label className="block mb-1">Product Image</label>
            <div className="mt-2">
              <img 
                src={previewImage} 
                alt="Product preview" 
                className="h-40 object-contain border rounded"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Image cannot be changed in edit mode. Please create a new product to use a different image.
            </p>
            <input type="hidden" name="image_url" value={originalImageUrl} />
          </div>
        )}
        
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Updating...' : 'Update Product'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage; 