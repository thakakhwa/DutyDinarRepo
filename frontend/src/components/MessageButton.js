// this file makes the chat button that appears at bottom right of screen
// it's a round green button with a chat icon inside

import React from 'react';

// MessageButton component - shows a floating chat button
// input: onClick - the function that runs when button is clicked
// output: a button element with styling
const MessageButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick} // when someone clicks this button, run the onClick function
      style={{
        // this makes the button stay in same spot even when scrolling
        position: 'fixed',
        bottom: '20px', // 20px from bottom of screen
        right: '20px', // 20px from right of screen
        zIndex: 1000, // this makes sure button shows on top of other things
        backgroundColor: '#10B981', // green color for button
        color: 'white', // white color for icon
        borderRadius: '50%', // this makes button perfectly round
        width: '56px', // button width
        height: '56px', // button height
        border: 'none', // no border
        cursor: 'pointer', // show hand cursor when mouse is over button
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)', // shadow effect to make button float
        display: 'flex', // these 3 lines center the icon in the button
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s', // smooth animation when hovering
      }}
      // when mouse hovers over button, make it slightly bigger with stronger shadow
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
      }}
      // when mouse leaves button, return to normal size
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.25)';
      }}
      aria-label="Chat Support" // this helps screen readers for blind people
      title="Chat Support" // this shows tooltip when mouse hovers
    >
      {/* this is the chat bubble icon using SVG */}
      {/* SVG is special image format that stays sharp at any size */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
};

// export so other files can use this component
export default MessageButton;
