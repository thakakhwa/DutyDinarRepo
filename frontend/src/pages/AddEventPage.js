import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addEvent } from '../api/add_events';

const AddEventPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_date: '',
    location: '',
    available_tickets: '',
    imageUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please select a valid image file.');
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setError('');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please drop a valid image file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.imageUrl) {
      setError('Please upload an image.');
      setLoading(false);
      return;
    }

    try {
      const data = {
        name: formData.name,
        description: formData.description,
        event_date: formData.event_date,
        location: formData.location,
        available_tickets: formData.available_tickets,
        image_url: formData.imageUrl,
      };

      const response = await addEvent(data);
      console.log('Add Event API response:', response);
      if (response.success) {
        alert('Event added successfully!');
        navigate('/seller-dashboard');
      } else {
        console.error('Add Event failed:', response);
        setError(response.message || 'Failed to add event');
      }
    } catch (err) {
      console.error('Add Event error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Add New Event</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-4">
          <label className="block mb-1 font-medium">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Event Date *</label>
          <input
            type="date"
            name="event_date"
            value={formData.event_date}
            onChange={handleInputChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Available Tickets</label>
          <input
            type="number"
            name="available_tickets"
            value={formData.available_tickets}
            onChange={handleInputChange}
            min="0"
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium">Image</label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="w-full h-40 border-4 border-dashed border-gray-400 rounded-lg flex items-center justify-center cursor-pointer bg-white mb-2"
            onClick={handleButtonClick}
          >
            {formData.imageUrl ? (
              <img src={formData.imageUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-gray-500">Drag and drop an image here or click to select</span>
            )}
          </div>
          <input
            type="file"
            name="image"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          {loading ? 'Adding...' : 'Add Event'}
        </button>
      </form>
    </div>
  );
};

export default AddEventPage;
