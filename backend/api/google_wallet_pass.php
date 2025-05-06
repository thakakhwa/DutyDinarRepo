<?php
// Simple Google Wallet mock implementation for development
require_once 'config.php';

// Define a simple function for creating wallet passes
function createGoogleWalletPass($eventId, $userId, $bookingId) {
    global $conn;
    
    try {
        // Always provide a mock wallet URL for now
        return [
            'success' => true,
            'wallet_url' => 'https://pay.google.com/gp/v/save/example_pass_' . time(),
            'pass_id' => 'mock-pass-' . $eventId . '-' . $bookingId . '-' . time(),
            'dev_mode' => true
        ];
    } catch (Exception $e) {
        error_log("Error creating Google Wallet pass: " . $e->getMessage());
        return [
            'success' => true, // Still return success to allow booking to proceed
            'message' => 'Failed to create Google Wallet pass: ' . $e->getMessage(),
            'mock' => true
        ];
    }
}

// If this file is called directly, handle the request
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    header('Content-Type: application/json');
    
    session_start();
    if (!isset($_SESSION['userId'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized: Please login.']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['event_id']) || !isset($data['booking_id'])) {
        echo json_encode(['success' => false, 'message' => 'Missing event_id or booking_id']);
        exit;
    }
    
    $result = createGoogleWalletPass($data['event_id'], $_SESSION['userId'], $data['booking_id']);
    echo json_encode($result);
}
?> 