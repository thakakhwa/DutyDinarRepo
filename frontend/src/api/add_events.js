// src/api/add_events.js

import axios from "axios";

const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api";

// Function to add an event
export const addEvent = async (formData) => {
  try {
    // Make the API request to add the event
    const response = await axios.post(
      `${API_BASE_URL}/add_events.php`,
      formData
    );

    // Log the raw response to inspect the returned data
    console.log("Raw response:", response.data);

    // Try to parse and handle the JSON response
    try {
      const data = response.data;

      if (data.success) {
        console.log("Event added successfully!");
        // Handle success actions like clearing the form or redirecting
      } else {
        console.error("Error adding event:", data.message);
        // Handle error actions (e.g., display error message to user)
      }
    } catch (jsonError) {
      console.error("Failed to parse JSON:", jsonError);
      alert("There was an error processing your request. Please try again.");
    }
  } catch (error) {
    // Catch any network or server errors
    console.error("Error adding event:", error);

    // Check if it's a CORS issue or network failure
    if (error.response) {
      console.error("Server responded with an error:", error.response.data);
    } else if (error.request) {
      console.error("No response from server:", error.request);
    } else {
      console.error("Error setting up the request:", error.message);
    }

    alert("There was an error adding the event. Please try again.");
  }
};
