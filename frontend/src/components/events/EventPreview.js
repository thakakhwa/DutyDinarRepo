import React, { useState, useEffect } from 'react';
import { Calendar, Package } from 'lucide-react';
import { getEvents } from '../../api/get_events';
import { getFullImageUrl } from '../../utils/imageUtils';

const EventPreview = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await getEvents();
      if (response.success) {
        setEvents(response.events.slice(0, 3));
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto mt-16 px-4 mb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold">Upcoming Events</h2>
        <a href="/events" className="text-green-600 hover:underline">View All Events</a>
      </div>
      {loading ? (
        <p>Loading events...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={getFullImageUrl(event.image_url)} alt={event.name} className="h-40 w-full object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{event.name}</h3>
                <div className="text-sm text-gray-600 mb-2">
                  <div className="flex items-center mb-1">
                    <Calendar className="mr-2" size={16} />
                    {event.event_date}
                  </div>
                  <div className="flex items-center">
                    <Package className="mr-2" size={16} />
                    {event.location}
                  </div>
                </div>
                <button className="w-full bg-green-600 text-white py-2 rounded-lg mt-2 hover:bg-green-700">
                  Book Tickets
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventPreview;
