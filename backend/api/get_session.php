<?php
// Start the session to access session variables
session_start();

header('Content-Type: application/json');

// Function to retrieve user data from the session
function getUserFromSession() {
    // Check if the session and user are set
    if (isset($_SESSION['user'])) {
        return $_SESSION['user'];
    } else {
        return null; // If session or user is not found
    }
}

// Handle the request to retrieve user data from session
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get the user data from the session
    $user = getUserFromSession();

    if ($user) {
        // Return success response with user data
        echo json_encode([
            'success' => true,
            'message' => 'User data retrieved successfully',
            'user' => $user
        ]);
    } else {
        // If no user found in session
        echo json_encode([
            'success' => false,
            'message' => 'No active session found. Please log in first.'
        ]);
    }
} else {
    // If request method is not GET
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}
?>
