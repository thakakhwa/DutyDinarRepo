import React, { useState } from 'react';
import { Calendar, Package, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const EventsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate(); // Initialize useNavigate

  // Function to handle "Details" button click
  const handleDetailsClick = (eventId) => {
    navigate(`/event/${eventId}`); // Navigate to EventDetailsPage with eventId
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-4">Trade Events & Conventions</h1>
          <p className="text-lg">Connect with industry leaders and discover new opportunities at upcoming B2B events.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="All">All Categories</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Technology">Technology</option>
            <option value="Medical">Medical</option>
            <option value="Textiles">Textiles</option>
          </select>
        </div>

        {/* Featured Event */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative">
            <div className="h-64 bg-gray-200"></div>
            <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg">
              Featured Event
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">International Trade Expo 2024</h2>
              <span className="text-green-600 font-semibold">$299</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center">
                <Calendar className="text-green-600 mr-2" size={20} />
                <span>March 15-17, 2024</span>
              </div>
              <div className="flex items-center">
                <MapPin className="text-green-600 mr-2" size={20} />
                <span>Dubai World Trade Centre</span>
              </div>
              <div className="flex items-center">
                <Users className="text-green-600 mr-2" size={20} />
                <span>5000+ Attendees</span>
              </div>
              <div className="flex items-center">
                <Package className="text-green-600 mr-2" size={20} />
                <span>500+ Exhibitors</span>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Join the largest B2B trade event in the region. Connect with manufacturers, suppliers, and industry experts from around the world.
            </p>
            <div className="flex gap-4">
              <button className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
                Book Tickets
              </button>
              <button className="flex-1 border border-green-600 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((event) => (
            <div key={event} className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gray-200 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 text-white font-semibold">
                    View Details
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Trade Show {event}</h3>
                <div className="text-sm text-gray-600 space-y-2 mb-4">
                  <div className="flex items-center">
                    <Calendar className="mr-2" size={16} />
                    March 15, 2024 - March 17, 2024
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2" size={16} />
                    Dubai World Trade Centre
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2" size={16} />
                    <span className="text-green-600 font-medium">500+</span> Expected Attendees
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                    Book Now
                  </button>
                  <button
                    onClick={() => handleDetailsClick(event)} // Navigate to EventDetailsPage
                    className="flex-1 border border-green-600 text-green-600 py-2 rounded-lg hover:bg-green-50"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;