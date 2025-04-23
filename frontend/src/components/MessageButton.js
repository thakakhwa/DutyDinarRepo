import React from 'react';

const MessageButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: '#3b82f6', // Tailwind blue-500
        color: 'white',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
      }}
      aria-label="Open Messages"
      title="Messages"
    >
      &#9993;
    </button>
  );
};

export default MessageButton;
