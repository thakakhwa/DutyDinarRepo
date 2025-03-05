import React, { useState } from 'react';
import { Calendar, MapPin, Users, Plus, Edit2, Trash2, Clock } from 'lucide-react';

const EventsPage = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');

  const events = [
    {
      id: 1,
      title: 'International Trade Expo 2024',
      location: 'Dubai World Trade Centre',
      date: '2024-03-15',
      time: '09:00 AM',
      attendees: 500,
      status: 'upcoming',
      image: '/placeholder.jpg'
    },
    // Add more events
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Events</h1>
        <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Plus size={20} className="mr-2" />
          Create Event
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          {['all', 'upcoming', 'ongoing', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize
                ${selectedStatus === status 
                  ? 'bg-green-100 text-green-600' 
                  : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                <div className="w-full h-full bg-gray-200"></div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                    ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                      event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'}`}>
                    {event.status}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2">{event.title}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    {event.date}
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    {event.time}
                  </div>
                  <div className="flex items-center">
                    <Users size={16} className="mr-2" />
                    {event.attendees} Attendees
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Edit2 size={16} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Showing 1 to 6 of 24 events
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">Previous</button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">1</button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">2</button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">3</button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;