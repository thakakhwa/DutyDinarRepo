<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
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
