import React, { useState } from 'react';
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

    if (result.success) {
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
            <label className="text-lg font-semibold">Event Date</label>
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold">Available Tickets</label>
            <input
              type="number"
              value={availableTickets}
              onChange={(e) => setAvailableTickets(e.target.value)}
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
