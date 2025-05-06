// this is the starting point of our react app
// it connects our app to the webpage

// import section - we get all the tools we need
import React from 'react';  // this is the main react library that makes everything work
import ReactDOM from 'react-dom/client';  // this helps put react on the webpage
import './index.css';  // this gets our basic styles
import App from './App';  // this is our main app component that has all our website
import reportWebVitals from './reportWebVitals';  // this helps check if website is fast

// this line finds the 'root' element in our html where we will put our react app
// it looks for <div id="root"></div> in public/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// this puts our App component inside the root element
// StrictMode makes react show more warnings to help us find problems
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// this helps track if our website is fast or slow
// it can send data about how fast the website loads
// if you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
