import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus, Edit2, Trash2, Clock } from 'lucide-react';
import EventModal from './EventModal';
import { fetchEvents, addEvent, updateEvent, deleteEvent } from '../../api/events';
import { fetchUsers } from '../../api/adminUsers';

const EventsPage = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [events, setEvents] = useState([]);
  const [sellers, setSellers] = useState([]);
  const mappedSellers = sellers.map(seller => ({
    ...seller,
    username: seller.name
  }));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentEvent, setCurrentEvent] = useState(null);

  const loadEvents = async () => {
    const response = await fetchEvents();
    if (response.success && Array.isArray(response.data)) {
      // Map backend fields to frontend expected fields
      const mappedEvents = response.data.map(event => {
        // Extract date and time from event_date (assumed format: YYYY-MM-DD HH:mm:ss)
        let date = '';
        let time = '';
        if (event.event_date) {
          const dt = new Date(event.event_date);
          date = dt.toISOString().split('T')[0]; // YYYY-MM-DD
          time = dt.toTimeString().split(' ')[0].slice(0,5); // HH:mm
        }
        return {
          ...event,
          // Removed mapping title: event.name to preserve name field directly
          date,
          time,
          image: event.image_url,
          available_tickets: event.available_tickets,
          price: event.price,
        };
      });
      setEvents(mappedEvents);
    } else {
      alert('Failed to fetch events: ' + response.message);
    }
  };

  const loadSellers = async () => {
    try {
      const response = await fetchUsers('', 'sellers', 1);
      console.log('loadSellers response:', response);
      if (response && response.success && Array.isArray(response.data)) {
        setSellers(response.data);
      } else if (Array.isArray(response)) {
        setSellers(response);
      } else if (response && Array.isArray(response.users)) {
        setSellers(response.users);
      } else {
        setSellers([]);
        console.error('Failed to fetch sellers: Unexpected response structure', response);
      }
    } catch (error) {
      setSellers([]);
      console.error('Error fetching sellers:', error.message || error);
    }
  };
  
  const openEditModal = (event) => {
    setModalMode('edit');
    console.log('openEditModal event:', event);
    // Map event fields to modal expected fields
    const mappedEvent = {
      ...event,
      // Removed mapping title: event.name to preserve name field directly
      date: event.date || '',
      time: event.time || '',
      image: event.image || event.image_url || '',
      available_tickets: event.available_tickets,
      price: event.price,
      seller: event.seller || event.seller_username || '', // try multiple possible fields
    };
    setCurrentEvent(mappedEvent);
    setIsModalOpen(true);
  };

  useEffect(() => {
    loadEvents();
    loadSellers();
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setCurrentEvent(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEvent(null);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const response = await deleteEvent(eventId);
      if (response.success) {
        alert('Event deleted successfully');
        loadEvents();
      } else {
        alert('Failed to delete event: ' + response.message);
      }
    }
  };

  const handleFormSubmit = async (eventData) => {
    // Validate date and time before submission
    if (!eventData.date || !eventData.time) {
      alert('Please fill in both date and time fields.');
      return;
    }

    // Removed mapping title to name for backend compatibility
    // eventData.name = eventData.title;

    // Combine date and time into event_date for backend
    if (eventData.date && eventData.time) {
      eventData.event_date = `${eventData.date} ${eventData.time}:00`;
    } else if (eventData.date) {
      eventData.event_date = `${eventData.date} 00:00:00`;
    } else {
      eventData.event_date = null;
    }

    // Remove mapping of image to image_url since modal uses image_url directly
    // eventData.image_url = eventData.image;
    // delete eventData.image;

    // Remove date and time fields as backend expects event_date
    delete eventData.date;
    delete eventData.time;

    // Remove id if null to avoid sending null id to backend
    if (eventData.id === null) {
      delete eventData.id;
    }

    console.log('Submitting eventData:', JSON.stringify(eventData));

    let response;
    if (modalMode === 'add') {
      if (modalMode === 'add' && eventData.seller) {
        console.log('handleFormSubmit: seller username:', eventData.seller);
        const seller = mappedSellers.find(s => s.username === eventData.seller);
        console.log('handleFormSubmit: found seller:', seller);
        if (seller) {
          eventData.seller_id = seller.id;
          console.log('handleFormSubmit: set seller_id:', eventData.seller_id);
          // Remove seller username field to avoid confusion in backend
          delete eventData.seller;
          console.log('handleFormSubmit: deleted seller username field');
        }
      }
      response = await addEvent(eventData);
    } else {
      if (eventData.seller) {
        console.log('handleFormSubmit: seller username:', eventData.seller);
        const seller = mappedSellers.find(s => s.username === eventData.seller);
        console.log('handleFormSubmit: found seller:', seller);
        if (seller) {
          eventData.seller_id = seller.id;
          console.log('handleFormSubmit: set seller_id:', eventData.seller_id);
          // Remove seller username field to avoid confusion in backend
          delete eventData.seller;
          console.log('handleFormSubmit: deleted seller username field');
        }
      }
      response = await updateEvent(eventData);
    }
    if (response.status) {
      alert(`Event ${modalMode === 'add' ? 'added' : 'updated'} successfully`);
      closeModal();
      loadEvents();
    } else {
      alert(`Failed to ${modalMode === 'add' ? 'add' : 'update'} event: ` + response.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Events</h1>
        <button
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={20} className="mr-2" />
          Create Event
        </button>
      </div>

      {isModalOpen && (
      <EventModal
        mode={modalMode}
        event={currentEvent}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        sellers={mappedSellers}
      />
      )}

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
          {events
            .filter(event => selectedStatus === 'all' || event.status === selectedStatus)
            .map((event) => (
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
                    <div className="flex items-center">
                      <span className="font-semibold mr-1">Price:</span> ${event.price}
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold mr-1">Available Tickets:</span> {event.available_tickets}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => openEditModal(event)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 size={16} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
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
            Showing {events.length} events
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
