import React, { useState, useEffect, useContext } from 'react';
import { getConversations, getMessages, sendMessage, searchUsers, createOrOpenConversation } from '../api/messaging';
import { AuthContext } from '../context/AuthContext';

const MessagePopup = ({ onClose }) => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // New states for search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversationId !== null) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      handleSearchUsers(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchConversations = async () => {
    setLoadingConversations(true);
    try {
      const data = await getConversations();
      if (data.success) {
        setConversations(data.conversations);
        if (data.conversations.length > 0) {
          setSelectedConversationId(data.conversations[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    setLoadingMessages(true);
    try {
      const data = await getMessages(conversationId);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    console.log('handleSendMessage called with:', { newMessage, selectedConversationId });
    if (newMessage.trim() === '' || selectedConversationId === null) {
      console.log('Message empty or no conversation selected');
      return;
    }
    try {
      const data = await sendMessage(selectedConversationId, newMessage.trim());
      console.log('sendMessage response:', data);
      if (data.success) {
        // Optimistically add the new message to the messages state
        const newMsg = {
          id: Date.now(), // temporary id
          conversation_id: selectedConversationId,
          sender_id: null, // or current user id if available
          sender_name: 'You',
          message: newMessage.trim(),
          created_at: new Date().toISOString(),
        };
        setMessages((prevMessages) => [...prevMessages, newMsg]);
        setNewMessage('');
        // Optionally, fetchMessages(selectedConversationId); // can be removed or kept for sync
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSearchUsers = async (query) => {
    setSearchLoading(true);
    try {
      const data = await searchUsers(query);
      if (data.success) {
        setSearchResults(data.users);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleUserSelect = async (user) => {
    try {
      const data = await createOrOpenConversation(user.id);
      if (data.success) {
        // Refresh conversations and select the new conversation
        await fetchConversations();
        setSelectedConversationId(data.conversation_id);
        setSearchTerm('');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error opening conversation:', error);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.3)',
          zIndex: 999,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '320px',
          height: '100vh',
          backgroundColor: 'white',
          boxShadow: '-2px 0 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '10px',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px' }}>Messages</h2>
          <button onClick={onClose} aria-label="Close Messages" style={{ fontSize: '18px', cursor: 'pointer', background: 'none', border: 'none' }}>
            &times;
          </button>
        </div>
        <div
          style={{
            borderBottom: '1px solid #ddd',
            padding: '10px',
          }}
        >
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
          {searchLoading && <p>Searching...</p>}
          {searchResults.length > 0 && (
            <div
              style={{
                maxHeight: '150px',
                overflowY: 'auto',
                marginTop: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white',
                zIndex: 1100,
                position: 'relative',
              }}
            >
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  style={{
                    padding: '8px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee',
                  }}
                >
                  {user.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              borderBottom: '1px solid #eee',
              padding: '10px',
              maxHeight: '150px',
              overflowY: 'auto',
            }}
          >
            {loadingConversations ? (
              <p>Loading conversations...</p>
            ) : conversations.length === 0 ? (
              <p>No conversations found.</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  style={{
                    padding: '8px',
                    cursor: 'pointer',
                    backgroundColor: conv.id === selectedConversationId ? '#3b82f6' : 'transparent',
                    color: conv.id === selectedConversationId ? 'white' : 'black',
                    borderRadius: '4px',
                    marginBottom: '4px',
                  }}
                >
                  {conv.participants}
                </div>
              ))
            )}
          </div>
          <div
            style={{
              flex: 1,
              padding: '10px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
              {loadingMessages ? (
                <p>Loading messages...</p>
              ) : messages.length === 0 ? (
                <p>No messages in this conversation.</p>
              ) : (
                messages.map((msg) => {
                  const currentUserId = user ? user.userId : null;
                  const isSender = msg.sender_id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: isSender ? 'flex-end' : 'flex-start',
                        backgroundColor: isSender ? '#3b82f6' : '#d3d3d3',
                        color: isSender ? 'white' : 'black',
                        padding: '8px 12px',
                        borderRadius: '16px',
                        maxWidth: '80%',
                        wordBreak: 'break-word',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{msg.sender_name}</div>
                      <div>{msg.message}</div>
                      <div style={{ fontSize: '10px', color: '#6b7280', textAlign: 'right' }}>{new Date(msg.created_at).toLocaleString()}</div>
                    </div>
                  );
                })
              )}
          </div>
        </div>
        {selectedConversationId !== null && (
          <div
            style={{
              padding: '10px',
              borderTop: '1px solid #ddd',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MessagePopup;
