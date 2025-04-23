<?php
require_once 'cors.php';
session_start();

// Check if session exists and return user data
if (isset($_SESSION['username']) && isset($_SESSION['userType']) && isset($_SESSION['userId'])) {
    echo json_encode([
        'status' => true,
        'data' => [
            'username' => $_SESSION['username'],
            'userType' => $_SESSION['userType'],
            'userId' => $_SESSION['userId']
        ]
    ]);
} else {
    echo json_encode([
        'status' => false,
        'message' => 'No active session found'
    ]);
}
?>
