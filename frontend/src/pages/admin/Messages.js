import React, { useState } from 'react';
import { 
  Search, Plus, Star, Image, Paperclip, Send,
  Phone, Video, MoreVertical, UserPlus, 
  ChevronDown, ArrowLeft, MessageSquare
} from 'lucide-react';

const MessagesPage = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [showMobileChat, setShowMobileChat] = useState(false);
  
  const chats = [
    {
      id: 1,
      name: 'John Smith',
      status: 'Online',
      avatar: '/placeholder.jpg',
      lastMessage: 'I need help with my recent order',
      time: '10:45 AM',
      unread: 3,
      isActive: true
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      status: 'Last seen 2h ago',
      avatar: '/placeholder.jpg',
      lastMessage: 'When will my order be delivered?',
      time: 'Yesterday',
      unread: 0,
      isActive: false
    },
    {
      id: 3,
      name: 'Michael Brown',
      status: 'Last seen yesterday',
      avatar: '/placeholder.jpg',
      lastMessage: 'Thank you for your help!',
      time: 'Mar 1',
      unread: 0,
      isActive: false
    },
    {
      id: 4,
      name: 'Emily Davis',
      status: 'Online',
      avatar: '/placeholder.jpg',
      lastMessage: 'Is this product available in blue?',
      time: 'Mar 1',
      unread: 1,
      isActive: false
    },
    {
      id: 5,
      name: 'David Wilson',
      status: 'Last seen 5h ago',
      avatar: '/placeholder.jpg',
      lastMessage: 'I would like to cancel my order',
      time: 'Feb 28',
      unread: 0,
      isActive: false
    }
  ];
  
  const messages = [
    {
      id: 1,
      senderId: 1,
      text: 'Hello, I need help with my recent order #ORD-12345.',
      time: '10:30 AM',
      isReceived: true
    },
    {
      id: 2,
      senderId: 'admin',
      text: 'Hi John, I\'d be happy to help you with your order. What seems to be the issue?',
      time: '10:32 AM',
      isReceived: false
    },
    {
      id: 3,
      senderId: 1,
      text: 'I ordered the product in blue, but I received it in black. Is it possible to exchange it?',
      time: '10:35 AM',
      isReceived: true
    },
    {
      id: 4,
      senderId: 'admin',
      text: 'I apologize for the inconvenience. Yes, we can definitely arrange an exchange for you. I\'ll need to check if we have the blue version in stock. One moment please.',
      time: '10:38 AM',
      isReceived: false
    },
    {
      id: 5,
      senderId: 'admin',
      text: 'Good news! We have the blue version available. I can arrange for a courier to pick up the black item and deliver the blue one. Would that work for you?',
      time: '10:42 AM',
      isReceived: false
    },
    {
      id: 6,
      senderId: 1,
      text: 'That sounds perfect! When can we arrange the exchange?',
      time: '10:45 AM',
      isReceived: true
    }
  ];

  const selectedChatData = chats.find(chat => chat.id === selectedChat);
  
  const openChat = (chatId) => {
    setSelectedChat(chatId);
    setShowMobileChat(true);
  };

  return (
    <div className="p-6 h-[calc(100vh-64px)]">
      <div className="flex h-full bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Contacts List */}
        <div className={`w-full md:w-80 border-r ${showMobileChat ? 'hidden' : 'block'} md:block`}>
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search contacts..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto h-[calc(100%-73px)]">
            {chats.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => openChat(chat.id)}
                className={`flex items-center p-4 border-b hover:bg-gray-50 cursor-pointer
                  ${selectedChat === chat.id ? 'bg-green-50' : ''}`}
              >
                <div className="relative mr-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  {chat.isActive && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate">{chat.name}</h3>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="ml-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {chat.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Chat Window */}
        <div className={`flex-1 flex flex-col ${showMobileChat ? 'block' : 'hidden'} md:block`}>
          {selectedChatData ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center">
                  <button 
                    className="md:hidden mr-2 p-1 rounded-lg hover:bg-gray-100"
                    onClick={() => setShowMobileChat(false)}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="relative mr-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    {selectedChatData.isActive && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedChatData.name}</h3>
                    <p className="text-xs text-gray-500">{selectedChatData.status}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Phone size={20} className="text-gray-600" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Video size={20} className="text-gray-600" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Star size={20} className="text-gray-600" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <MoreVertical size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex ${message.isReceived ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isReceived 
                            ? 'bg-white border' 
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        <p>{message.text}</p>
                        <span className={`text-xs block text-right mt-1 ${
                          message.isReceived ? 'text-gray-500' : 'text-green-100'
                        }`}>
                          {message.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Paperclip size={20} className="text-gray-600" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Image size={20} className="text-gray-600" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700">
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="p-6 rounded-full bg-gray-100 mb-4">
                <MessageSquare size={48} />
              </div>
              <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
              <p>Choose a contact to start messaging</p>
              <button className="mt-4 flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <UserPlus size={20} className="mr-2" />
                New Conversation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;