import React, { useEffect, useState } from 'react';
import { getBookedEvents } from '../api/get_booked_events';
import { getFullImageUrl } from '../utils/imageUtils';

const BookedEventsPage = () => {
  const [bookedEvents, setBookedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookedEvents = async () => {
      try {
        const events = await getBookedEvents();
        setBookedEvents(events);
      } catch (err) {
        setError('Failed to load booked events.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookedEvents();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  if (loading) {
    return <div className="p-4">Loading booked events...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  if (bookedEvents.length === 0) {
    return <div className="p-4">You have no booked events.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Booked Events</h1>
      <ul className="space-y-4">
        {bookedEvents.map(event => {
          const price = parseFloat(event.price);
          const formattedPrice = !isNaN(price) ? price.toFixed(2) : "N/A";

          return (
            <li key={event.id} className="border rounded-lg shadow-md overflow-hidden">
              <img
                src={getFullImageUrl(event.image_url)}
                alt={event.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{event.name}</h2>
                <p className="text-gray-600 mb-2">{event.description}</p>
                <p className="mb-1">{new Date(event.event_date).toLocaleString()}</p>
                <p className="mb-1">{event.location}</p>
                <p className="mb-1">Quantity Booked: {event.quantity}</p>
                <p className="font-semibold">${formattedPrice}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BookedEventsPage;
