import React, { useState, useEffect } from 'react';
import { Calendar, Package, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../api/get_events';
import { getFullImageUrl } from '../utils/imageUtils';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await getEvents();
      if (response.success) {
        setEvents(response.events);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const handleDetailsClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

      useEffect(() => {
         window.scrollTo({
              top: 0,
              behavior: "smooth",
          });
          }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Trade Events & Conventions</h1>
        {loading ? (
          <p>Loading events...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              // Ensure the price is a valid number
              const price = parseFloat(event.price);
              const formattedPrice = !isNaN(price) ? price.toFixed(2) : "N/A"; // Fallback if the price is not a number

              return (
                <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img src={getFullImageUrl(event.image_url)} alt={event.name} className="h-48 w-full object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{event.name}</h3>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    <div className="text-sm text-gray-600 space-y-2 mb-4">
                      <div className="flex items-center"><Calendar className="mr-2" size={16} /> {event.event_date}</div>
                      <div className="flex items-center"><MapPin className="mr-2" size={16} /> {event.location}</div>
                      <div className="flex items-center"><Users className="mr-2" size={16} /> {event.available_tickets} Tickets Available</div>
                      <div className="flex items-center"><Package className="mr-2" size={16} /> ${formattedPrice}</div>
                    </div>
                    <button
                      onClick={() => handleDetailsClick(event.id)}
                      className="w-full bg-green-600 text-white py-2 rounded-lg mt-2 hover:bg-green-700"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
