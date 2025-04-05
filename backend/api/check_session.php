<?php
require_once 'session_config.php';

// Set CORS headers first (before any output)
set_session_cors_headers();

// Configure and start session
configure_session();

header("Content-Type: application/json");

// Check if session exists
if (isset($_SESSION['user'])) {
    echo json_encode([
        'status' => true,
        'message' => 'User is logged in.',
        'data' => $_SESSION['user']
    ]);
} else {
    echo json_encode([
        'status' => false,
        'message' => 'User is not logged in.'
    ]);
}
?>