import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Package } from 'lucide-react';

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`http://localhost/DutyDinarRepo/backend/api/get_events.php?id=${eventId}`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success && data.data && data.data.events && data.data.events.length > 0) {
          setEvent(data.data.events[0]);
        } else {
          alert('Event not found');
          navigate('/events');
        }
      } catch (error) {
        alert('Failed to load event data');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, navigate]);

  const handleBookTickets = async () => {
    setBookingLoading(true);
    try {
      const response = await fetch('http://localhost/DutyDinarRepo/backend/api/book_event.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: event.id, quantity: 1 }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Event booked successfully!');
        // Refresh the page to update booking status
        window.location.reload();
      } else {
        alert(data.message || 'Failed to book event');
      }
    } catch (error) {
      alert('Error booking event');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading event...</div>;
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <span className="mr-2">←</span> Back to Events
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative">
            <img src={event.image_url || ''} alt={event.name} className="h-64 w-full object-cover" />
            <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg">
              Featured Event
            </div>
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center">
                <Calendar className="text-green-600 mr-2" size={20} />
                <span>{new Date(event.event_date).toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="text-green-600 mr-2" size={20} />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center">
                <Users className="text-green-600 mr-2" size={20} />
                <span>{event.attendees || 'N/A'} Attendees</span>
              </div>
              <div className="flex items-center">
                <Package className="text-green-600 mr-2" size={20} />
                <span>{event.exhibitors || 'N/A'} Exhibitors</span>
              </div>
            </div>
            <p className="text-gray-600 mb-6">{event.description}</p>

            {!event.booked_quantity ? (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mt-1">
                  {event.available_tickets} tickets available
                </p>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={handleBookTickets}
                    disabled={bookingLoading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    {bookingLoading ? 'Booking...' : 'Book Tickets'}
                  </button>
                  <button className="flex-1 border border-green-600 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50">
                    Contact Organizer
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex-1 py-3 rounded-lg font-semibold bg-gray-400 text-white cursor-not-allowed flex items-center justify-center">
                Booked
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
