<?php
/**
 * Google Wallet Pass Generation API
 * 
 * This API endpoint generates Google Wallet passes for events
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/google_pass_api.log');

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Include the GooglePassGenerator class
require_once 'google_pass_generator.php';
require_once '../config.php'; // Database connection

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Ensure this is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Start session for authentication
session_start();

// Check user authentication
if (!isset($_SESSION['userId'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized', 'auth_required' => true]);
    exit;
}

// Parse the input JSON
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($input['event_id']) || !isset($input['booking_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$eventId = (int)$input['event_id'];
$bookingId = (int)$input['booking_id'];
$userId = (int)$_SESSION['userId'];

try {
    // Get the event details
    $eventStmt = $conn->prepare("
        SELECT e.id, e.name, e.event_date, e.location 
        FROM events e
        WHERE e.id = ?
    ");
    $eventStmt->bind_param('i', $eventId);
    $eventStmt->execute();
    $eventResult = $eventStmt->get_result();
    
    if ($eventResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Event not found']);
        exit;
    }
    
    $eventData = $eventResult->fetch_assoc();
    $eventStmt->close();
    
    // Get user details
    $userStmt = $conn->prepare("SELECT id, name, email FROM users WHERE id = ?");
    $userStmt->bind_param('i', $userId);
    $userStmt->execute();
    $userResult = $userStmt->get_result();
    
    if ($userResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
    
    $userData = $userResult->fetch_assoc();
    $userStmt->close();
    
    // Verify booking exists and belongs to this user
    $bookingStmt = $conn->prepare("
        SELECT eb.id, eb.quantity
        FROM event_bookings eb
        WHERE eb.id = ? AND eb.user_id = ? AND eb.event_id = ?
    ");
    $bookingStmt->bind_param('iii', $bookingId, $userId, $eventId);
    $bookingStmt->execute();
    $bookingResult = $bookingStmt->get_result();
    
    if ($bookingResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Booking not found or not authorized']);
        exit;
    }
    
    $bookingData = $bookingResult->fetch_assoc();
    $bookingStmt->close();
    
    // Now generate the Google Wallet pass
    $passGenerator = new GooglePassGenerator();
    $passResult = $passGenerator->generateEventTicketPass($eventData, $userData, [
        'booking_id' => $bookingId,
        'quantity' => $bookingData['quantity']
    ]);
    
    if (!$passResult['success']) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to generate pass', 'error' => $passResult['message']]);
        exit;
    }
    
    // Return success with the pass URL
    echo json_encode([
        'success' => true,
        'message' => 'Google Wallet pass generated successfully',
        'pass_url' => $passResult['pass_url'],
        'pass_id' => $passResult['pass_id'],
        'object_id' => $passResult['object_id']
    ]);
    
} catch (Exception $e) {
    error_log("Error in generate_google_pass.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error', 'error' => $e->getMessage()]);
    exit;
}
?> 