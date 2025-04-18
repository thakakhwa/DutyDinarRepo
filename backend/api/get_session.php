<?php
session_start();

// Check if session exists and return user data
if (isset($_SESSION['username']) && isset($_SESSION['userType'])) {
    echo json_encode([
        'status' => true,
        'data' => [
            'username' => $_SESSION['username'],
            'userType' => $_SESSION['userType']
        ]
    ]);
} else {
    echo json_encode([
        'status' => false,
        'message' => 'No active session found'
    ]);
}
?>
