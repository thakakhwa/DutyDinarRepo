import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addEvent } from '../api/add_events'; // Import the addEvent function

const AddEventPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [availableTickets, setAvailableTickets] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select a valid image file.');
      }
    } else {
      switch (name) {
        case 'name':
          setName(value);
          break;
        case 'description':
          setDescription(value);
          break;
        case 'eventDate':
          setEventDate(value);
          break;
        case 'location':
          setLocation(value);
          break;
        case 'price':
          setPrice(value);
          break;
        case 'availableTickets':
          setAvailableTickets(value);
          break;
        default:
          break;
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please drop a valid image file.');
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
    setLoading(true);

    const eventData = {
      name,
      description,
      event_date: eventDate,
      location,
      price,
      available_tickets: availableTickets,
      image_url: imageUrl,
    };

    const result = await addEvent(eventData); // Call the API utility function

    if (result.status) {
      alert('Event added successfully');
      navigate('/seller-dashboard'); // Redirect to dashboard
    } else {
      alert(result.message || 'Failed to add event');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Add New Event</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="space-y-2">
            <label className="text-lg font-semibold">Event Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Description</label>
            <textarea
              name="description"
              value={description}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Event Date</label>
            <input
              type="datetime-local"
              name="eventDate"
              value={eventDate}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Location</label>
            <input
              type="text"
              name="location"
              value={location}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Price</label>
            <input
              type="number"
              name="price"
              value={price}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Available Tickets</label>
            <input
              type="number"
              name="availableTickets"
              value={availableTickets}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Image</label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="w-full h-40 border-4 border-dashed border-gray-400 rounded-lg flex items-center justify-center cursor-pointer bg-white mb-2"
              onClick={handleButtonClick}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
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
            className="w-full bg-green-600 text-white py-2 rounded-lg mt-4 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Adding Event...' : 'Add Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEventPage;
