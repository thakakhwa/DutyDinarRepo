import React from 'react';
import { Calendar, Package } from 'lucide-react';

const EventPreview = () => {
  return (
    <div className="max-w-7xl mx-auto mt-16 px-4 mb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold">Upcoming Events</h2>
        <a href="/events" className="text-green-600 hover:underline">View All Events</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((event) => (
          <div key={event} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-40 bg-gray-200 relative">
              <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-lg">
                Featured
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">Trade Convention 2024</h3>
              <div className="text-sm text-gray-600 mb-2">
                <div className="flex items-center mb-1">
                  <Calendar className="mr-2" size={16} />
                  March 15, 2024 - March 17, 2024
                </div>
                <div className="flex items-center">
                  <Package className="mr-2" size={16} />
                  Dubai World Trade Centre
                </div>
              </div>
              <button className="w-full bg-green-600 text-white py-2 rounded-lg mt-2">
                Book Tickets
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventPreview;