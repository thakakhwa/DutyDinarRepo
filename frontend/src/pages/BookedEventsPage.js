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
                {/* Removed Quantity Booked display */}
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to unbook this event?')) {
                      try {
                        const response = await fetch('http://localhost/DutyDinarRepo/backend/api/unbook_event.php', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          credentials: 'include',
                          body: JSON.stringify({ event_id: event.id }),
                        });
                        const data = await response.json();
                        if (data.success) {
                          alert('Event unbooked successfully');
                          setBookedEvents((prev) => prev.filter((e) => e.id !== event.id));
                        } else {
                          alert('Failed to unbook event: ' + data.message);
                        }
                      } catch (error) {
                        alert('Error unbooking event');
                      }
                    }
                  }}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Unbook
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BookedEventsPage;
