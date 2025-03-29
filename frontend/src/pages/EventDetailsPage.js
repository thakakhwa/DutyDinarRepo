import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Package } from 'lucide-react';

const EventDetailsPage = () => {
  const { eventId } = useParams(); // Get eventId from the URL
  const navigate = useNavigate();

  // Sample event data (replace with API call or state management)
  const event = {
    id: eventId,
    name: `Trade Show ${eventId}`,
    date: 'March 15-17, 2024',
    location: 'Dubai World Trade Centre',
    attendees: '5000+',
    exhibitors: '500+',
    description: 'Join the largest B2B trade event in the region. Connect with manufacturers, suppliers, and industry experts from around the world.',
    price: '$299',
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
        <button
          onClick={() => navigate(-1)} // Go back to the previous page
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <span className="mr-2">←</span> Back to Events
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative">
            <div className="h-64 bg-gray-200"></div>
            <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg">
              Featured Event
            </div>
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center">
                <Calendar className="text-green-600 mr-2" size={20} />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="text-green-600 mr-2" size={20} />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center">
                <Users className="text-green-600 mr-2" size={20} />
                <span>{event.attendees} Attendees</span>
              </div>
              <div className="flex items-center">
                <Package className="text-green-600 mr-2" size={20} />
                <span>{event.exhibitors} Exhibitors</span>
              </div>
            </div>
            <p className="text-gray-600 mb-6">{event.description}</p>
            <div className="flex gap-4">
              <button className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
                Book Tickets
              </button>
              <button className="flex-1 border border-green-600 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50">
                Contact Organizer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;