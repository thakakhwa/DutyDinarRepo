<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config.php';
require_once 'cors.php';

session_start();
header('Content-Type: application/json');

error_log("Session data: " . print_r($_SESSION, true));
error_log("Raw input: " . file_get_contents('php://input'));

try {
    // Check if user is logged in and is a seller
    if (!isset($_SESSION['userId']) || !isset($_SESSION['userType']) || $_SESSION['userType'] !== 'seller') {
        http_response_code(403);
        echo json_encode([
            'status' => false,
            'message' => 'Unauthorized: Only authenticated sellers can add events'
        ]);
        exit();
    }

    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        throw new Exception('Invalid JSON input', 400);
    }

    // Required fields
    $requiredFields = ['name', 'description', 'event_date', 'location', 'price', 'available_tickets', 'image_url'];
    foreach ($requiredFields as $field) {
        if (!isset($input[$field]) || $input[$field] === '') {
            throw new Exception("Missing required field: $field", 400);
        }
    }

    // Validate data types
    if (!is_string($input['name']) || !is_string($input['description']) || !is_string($input['event_date']) || !is_string($input['location']) || !is_string($input['image_url'])) {
        throw new Exception('Invalid data type for string fields', 400);
    }
    if (!is_numeric($input['price']) || !is_numeric($input['available_tickets'])) {
        throw new Exception('Price and available_tickets must be numeric', 400);
    }

    // Prepare and execute insert statement
    $stmt = $conn->prepare("INSERT INTO events (seller_id, name, description, event_date, location, price, available_tickets, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        throw new Exception('Database prepare failed: ' . $conn->error, 500);
    }

    $sellerId = $_SESSION['userId'];
    $name = $input['name'];
    $description = $input['description'];
    $eventDate = $input['event_date'];
    $location = $input['location'];
    $price = floatval($input['price']);
    $availableTickets = intval($input['available_tickets']);
    $imageUrl = $input['image_url'];

    $bind = $stmt->bind_param("issssdis", $sellerId, $name, $description, $eventDate, $location, $price, $availableTickets, $imageUrl);
    if (!$bind) {
        throw new Exception('Parameter binding failed: ' . $stmt->error, 500);
    }

    if (!$stmt->execute()) {
        throw new Exception('Database execute failed: ' . $stmt->error, 500);
    }

    echo json_encode([
        'status' => true,
        'message' => 'Event added successfully',
        'eventId' => $stmt->insert_id
    ]);
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    error_log('Add Event API error: ' . $e->getMessage());
    echo json_encode([
        'status' => false,
        'message' => $e->getMessage()
    ]);
}
?>
