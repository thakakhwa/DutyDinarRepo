import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { updateEvent } from '../api/events';
import { AuthContext } from '../context/AuthContext';

const EditEventPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState({
    id: '',
    name: '',
    description: '',
    event_date: '',
    location: '',
    available_tickets: '',
    image_url: ''
  });
  const [previewImage, setPreviewImage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [originalImageUrl, setOriginalImageUrl] = useState('');

  useEffect(() => {
    // Check authentication
    if (!user || user.userType !== 'seller') {
      navigate('/login');
      return;
    }

    // Check if we have event data
    if (!location.state || !location.state.event) {
      console.error("No event data found in location state");
      navigate('/inventory');
      return;
    }

    const event = location.state.event;
    console.log("Event data from location state:", event);
    
    // Store the original image URL, but only if it's valid
    setOriginalImageUrl(event.image_url && event.image_url !== '0' ? event.image_url : '');

    try {
      // Format date for input field (YYYY-MM-DD)
      let formattedDate = '';
      if (event.event_date) {
        const date = new Date(event.event_date);
        formattedDate = date.toISOString().split('T')[0];
      }
      
      // Set event data
      setEventData({
        id: event.id,
        name: event.name || '',
        description: event.description || '',
        event_date: formattedDate,
        location: event.location || '',
        available_tickets: event.available_tickets || '',
        image_url: event.image_url && event.image_url !== '0' ? event.image_url : ''
      });
      
      // Set preview image only if image_url is valid
      if (event.image_url && event.image_url !== '0') {
        setPreviewImage(event.image_url.startsWith('data:') 
          ? event.image_url 
          : `${process.env.REACT_APP_API_URL || ''}/${event.image_url}`);
      }
    } catch (error) {
      console.error("Error setting event data:", error);
      setErrorMessage("Failed to process event data");
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // Validate form
      if (!eventData.name || !eventData.description || !eventData.event_date || !eventData.location || !eventData.available_tickets) {
        setErrorMessage('All fields except image are required');
        setLoading(false);
        return;
      }

      // Ensure available_tickets is a valid integer
      const availableTickets = parseInt(eventData.available_tickets);
      if (isNaN(availableTickets) || availableTickets < 0) {
        setErrorMessage('Available tickets must be a valid non-negative integer');
        setLoading(false);
        return;
      }

      // Ensure event date is valid
      const eventDate = new Date(eventData.event_date);
      if (isNaN(eventDate.getTime())) {
        setErrorMessage('Please enter a valid event date');
        setLoading(false);
        return;
      }

      // Debug log to check the originalImageUrl value
      console.log("Original Image URL before submit:", originalImageUrl);
      console.log("Type of originalImageUrl:", typeof originalImageUrl);
      
      // Prepare the data for submission
      const dataToSubmit = {
        ...eventData,
        available_tickets: availableTickets,
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

      console.log("Submitting event data with image_url:", dataToSubmit.image_url);
      const result = await updateEvent(dataToSubmit);
      console.log("Update result:", result);
      
      if (result.success) {
        navigate('/inventory');
      } else {
        setErrorMessage(result.message || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      setErrorMessage('An unexpected error occurred: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state if data isn't loaded yet
  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-6">Loading event data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1">Event Name</label>
          <input
            type="text"
            name="name"
            value={eventData.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            name="description"
            value={eventData.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            rows="4"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Event Date</label>
            <input
              type="date"
              name="event_date"
              value={eventData.event_date}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={eventData.location}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block mb-1">Available Tickets</label>
          <input
            type="number"
            name="available_tickets"
            value={eventData.available_tickets}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            min="0"
            required
          />
        </div>
        
        {/* Display event image if available, but don't allow changing it */}
        {previewImage && (
          <div>
            <label className="block mb-1">Event Image</label>
            <div className="mt-2">
              <img 
                src={previewImage} 
                alt="Event preview" 
                className="h-40 object-contain border rounded"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Image cannot be changed in edit mode. Please create a new event to use a different image.
            </p>
          </div>
        )}
        
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Updating...' : 'Update Event'}
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

export default EditEventPage; 