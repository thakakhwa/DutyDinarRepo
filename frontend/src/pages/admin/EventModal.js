import React, { useState, useEffect } from 'react';

const EventModal = ({ mode, event, onClose, onSubmit, sellers }) => {
  const [formData, setFormData] = useState({
    id: event?.id || null,
    name: event?.name || '',
    description: event?.description || '',
    location: event?.location || '',
    time: event?.time ?? '',
    date: event?.date || '',
    attendees: event?.attendees ?? 0,
    status: event?.status || 'upcoming',
    image_url: event?.image_url || '',
    price: event?.price ?? '',
    available_tickets: event?.available_tickets ?? '',
    seller: (event?.seller ?? (sellers.length > 0 ? sellers[0].username : '')) || '',
  });

  useEffect(() => {
    setFormData({
      id: event?.id || null,
      name: event?.name || '',
      description: event?.description || '',
      location: event?.location || '',
      time: event?.time ?? '',
      date: event?.date || '',
      attendees: event?.attendees ?? 0,
      status: event?.status || 'upcoming',
      image_url: event?.image_url || '',
      price: event?.price ?? '',
      available_tickets: event?.available_tickets ?? '',
      seller: (event?.seller ?? (sellers.length > 0 ? sellers[0].username : '')) || '',
    });
  }, [event, sellers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value === null ? '' : value });
  };

  const handleSellerChange = (e) => {
    setFormData({ ...formData, seller: e.target.value === null ? '' : e.target.value });
  };

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // prevent double submit
    if (!formData.date || !formData.time) {
      alert('Please fill in both date and time fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg overflow-auto max-h-full">
        <h2 className="text-xl font-semibold mb-4">{mode === 'add' ? 'Add Event' : 'Edit Event'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium">Time</label>
              <input
                type="time"
                name="time"
                value={formData.time || ''}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date || ''}
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
              value={formData.price || ''}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Available Tickets</label>
            <input
              type="number"
              name="available_tickets"
              value={formData.available_tickets || ''}
              onChange={handleChange}
              min="0"
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Attendees</label>
            <input
              type="number"
              name="attendees"
              value={formData.attendees ?? 0}
              onChange={handleChange}
              min="0"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select
              name="status"
              value={formData.status || 'upcoming'}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Image URL</label>
            <input
              type="text"
              name="image_url"
              value={formData.image_url || ''}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            {formData.image_url && (
              <img
                src={(formData.image_url && !formData.image_url.startsWith('http') ? `${process.env.REACT_APP_BACKEND_URL || ''}/${formData.image_url}` : formData.image_url)}
                alt="Event"
                className="mt-2 max-h-48 object-contain"
              />
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">Seller</label>
            <select
              name="seller"
              value={formData.seller || ''}
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

export default EventModal;
