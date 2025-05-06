import React, { useEffect, useState } from 'react';
import { getBookedEvents } from '../api/get_booked_events';
import { getFullImageUrl } from '../utils/imageUtils';
import { Wallet } from 'lucide-react';

const BookedEventsPage = () => {
  const [bookedEvents, setBookedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unbookingEvent, setUnbookingEvent] = useState(null);
  const [walletUrls, setWalletUrls] = useState({});

  const fetchBookedEvents = async () => {
    try {
      const events = await getBookedEvents();
      setBookedEvents(events);
      
      // Fetch Google Wallet pass URLs for each booked event
      events.forEach(event => {
        fetchWalletUrl(event.id, event.booking_id);
      });
    } catch (err) {
      setError('Failed to load booked events.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchWalletUrl = async (eventId, bookingId) => {
    if (!eventId || !bookingId) return;
    
    try {
      const response = await fetch('http://localhost/DutyDinarRepo/backend/api/google_wallet_pass.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ event_id: eventId, booking_id: bookingId }),
      });
      
      // Handle non-200 responses
      if (!response.ok) {
        console.error(`Error fetching wallet URL: ${response.status} ${response.statusText}`);
        return;
      }
      
      const data = await response.json();
      if (data.success && data.wallet_url) {
        setWalletUrls(prev => ({
          ...prev,
          [eventId]: data.wallet_url
        }));
      } else if (data.message) {
        console.log(`Wallet URL not available: ${data.message}`);
      }
    } catch (error) {
      console.error('Error fetching wallet URL:', error);
      // Silently fail - wallet URL is optional
    }
  };

  useEffect(() => {
    fetchBookedEvents();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const handleUnbookEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to unbook this event?')) {
      try {
        setUnbookingEvent(eventId);
        const response = await fetch('http://localhost/DutyDinarRepo/backend/api/unbook_event.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ event_id: eventId }),
        });
        const data = await response.json();
        if (data.success) {
          // Remove the event from the state
          setBookedEvents((prev) => prev.filter((e) => e.id !== eventId));
          alert('Event unbooked successfully');
        } else {
          alert('Failed to unbook event: ' + data.message);
        }
      } catch (error) {
        alert('Error unbooking event');
      } finally {
        setUnbookingEvent(null);
      }
    }
  };

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
                <div className="flex space-x-2 mt-3">
                  {walletUrls[event.id] && (
                    <a 
                      href={walletUrls[event.id]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                    >
                      <Wallet size={18} className="mr-2" />
                      Add to Google Wallet
                    </a>
                  )}
                  <button
                    onClick={() => handleUnbookEvent(event.id)}
                    disabled={unbookingEvent === event.id}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {unbookingEvent === event.id ? 'Unbooking...' : 'Unbook'}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BookedEventsPage;
