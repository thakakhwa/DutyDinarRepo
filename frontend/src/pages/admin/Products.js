import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Grid, List } from 'lucide-react';
import { getProducts } from '../../api/get_products';
import { addProduct, getCategories } from '../../api/add_products';
import { updateProduct } from '../../api/update_products';
import { deleteProduct } from '../../api/delete_products';
import { fetchUsers } from '../../api/adminUsers';

const ProductModal = ({ mode, product, onClose, onSubmit, categories, sellers }) => {
  const [formData, setFormData] = useState({
    id: product?.id || null,
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || '',
    minOrderQuantity: product?.minOrderQuantity || 1,
    image_url: product?.image_url || '',
    categories: product ? [product.category] : [],
    seller: product?.seller || (sellers.length > 0 ? sellers[0].username : ''),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'categories') {
      setFormData({ ...formData, categories: [value] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSellerChange = (e) => {
    setFormData({ ...formData, seller: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">{mode === 'add' ? 'Add Product' : 'Edit Product'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Minimum Order Quantity</label>
            <input
              type="number"
              name="minOrderQuantity"
              value={formData.minOrderQuantity}
              onChange={handleChange}
              required
              min="1"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Image URL</label>
            <input
              type="text"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Category</label>
          <select
            name="categories"
            value={formData.categories[0] || ''}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="" disabled>Select category</option>
            {categories.map((cat, index) => (
              <option key={cat} value={index + 1}>
                {cat}
              </option>
            ))}
          </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Seller</label>
            <select
              name="seller"
              value={formData.seller}
              onChange={handleSellerChange}
              required
              className="w-full border rounded px-3 py-2"
            >
              {sellers.map((seller) => (
                <option key={seller.id} value={seller.username}>
                  {seller.username}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {mode === 'add' ? 'Add' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProductsPage = () => {
  const [viewType, setViewType] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [sellers, setSellers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentProduct, setCurrentProduct] = useState(null);

  const fetchProducts = async () => {
    const categoryParam = selectedCategory === 'all' ? '' : selectedCategory;
    const response = await getProducts(categoryParam, '', [0, 9999999], 0);
    if (response.success) {
      setProducts(response.products);
    } else {
      alert('Failed to fetch products: ' + response.message);
    }
  };

  const fetchCategories = async () => {
    const response = await getCategories();
    console.log('getCategories response:', response);
    if (response.success && response.data && Array.isArray(response.data.categories)) {
      const categoryNames = response.data.categories.map(cat => cat.name.toLowerCase());
      setCategories(['all', ...categoryNames]);
    } else if (response.success) {
      // Categories fetched successfully but no categories array found
      setCategories(['all']);
    } else {
      alert('Failed to fetch categories: ' + response.message);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      // Adjust filter value if needed, here assuming 'seller' is correct
      const response = await fetchUsers('', 'sellers', 1);
      console.log('fetchSellers response:', response);
      if (response.success && response.data && Array.isArray(response.data)) {
        setSellers(response.data);
      } else {
        setSellers([]);
        console.error('Failed to fetch sellers:', response.message);
      }
    } catch (error) {
      setSellers([]);
      console.error('Error fetching sellers:', error);
    }
  };

  // Map sellers to have username property for dropdown value
  const mappedSellers = sellers.map(seller => ({
    ...seller,
    username: seller.name
  }));

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const openAddModal = () => {
    setModalMode('add');
    setCurrentProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode('edit');
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const response = await deleteProduct(productId);
      if (response.success) {
        alert('Product deleted successfully');
        fetchProducts();
      } else {
        alert('Failed to delete product: ' + response.message);
      }
    }
  };

  const handleFormSubmit = async (productData) => {
    let response;
    if (modalMode === 'add') {
      // Include seller_id in productData when admin adds product
      if (modalMode === 'add' && productData.seller) {
        const seller = mappedSellers.find(s => s.username === productData.seller);
        if (seller) {
          productData.seller_id = seller.id;
        }
      }
      console.log('Submitting productData:', productData);
      response = await addProduct(productData);
    } else {
      response = await updateProduct(productData);
    }
    if (response.success) {
      alert(`Product ${modalMode === 'add' ? 'added' : 'updated'} successfully`);
      closeModal();
      fetchProducts();
    } else {
      alert(`Failed to ${modalMode === 'add' ? 'add' : 'update'} product: ` + response.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <button
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={20} className="mr-2" />
          Add Product
        </button>
      </div>

      {isModalOpen && (
        <ProductModal
          mode={modalMode}
          product={currentProduct}
          onClose={closeModal}
          onSubmit={handleFormSubmit}
          categories={categories}
          sellers={mappedSellers}
        />
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex gap-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category.toLowerCase())}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                  ${selectedCategory === category.toLowerCase()
                    ? 'bg-green-100 text-green-600'
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewType('grid')}
                className={`p-2 ${viewType === 'grid' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`p-2 ${viewType === 'list' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {viewType === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products
              .filter((product) =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((product) => (
                <div key={product.id} className="border rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="aspect-w-4 aspect-h-3 bg-gray-100 relative">
                    {/* Product Image */}
                    <img src={product.image_url || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="font-medium text-green-600">${product.price}</span>
                      <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          // List View
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4">Product</th>
                  <th className="text-left py-4 px-4">Category</th>
                  <th className="text-left py-4 px-4">Price</th>
                  <th className="text-left py-4 px-4">Stock</th>
                  <th className="text-left py-4 px-4">Seller</th>
                  <th className="text-left py-4 px-4">Status</th>
                  <th className="text-left py-4 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter((product) =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded"></div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{product.category}</td>
                      <td className="py-4 px-4 font-medium">${product.price}</td>
                      <td className="py-4 px-4 text-gray-600">{product.stock}</td>
                      <td className="py-4 px-4 text-gray-600">{product.seller}</td>
                      <td className="py-4 px-4 text-gray-600">{product.status}</td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => openEditModal(product)}
                          className="mr-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
