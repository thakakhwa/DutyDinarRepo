<?php
require_once 'config.php';
require_once 'cors.php';

session_start();
header('Content-Type: application/json');

try {
    // Verify seller session
    error_log("Session data: " . print_r($_SESSION, true)); // Log session data
    if (!isset($_SESSION['userId']) || !isset($_SESSION['userType']) || $_SESSION['userType'] !== 'seller') {
        throw new Exception('Only authenticated sellers can add events', 403);
    }

    // Validate input
    $input = json_decode(file_get_contents('php://input'), true);
    $requiredFields = ['name', 'description', 'event_date'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            throw new Exception("Missing required field: $field", 400);
        }
    }

    // Prepare database query
    $stmt = $conn->prepare("INSERT INTO events 
        (seller_id, name, description, event_date, location, price, available_tickets, image_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->bind_param(
        "issssdii",
        $_SESSION['userId'],
        $input['name'],
        $input['description'],
        $input['event_date'],
        $input['location'] ?? '',
        $input['price'] ?? 0,
        $input['available_tickets'] ?? 0,
        $input['image_url'] ?? ''
    );

    if ($stmt->execute()) {
        error_log("Event added successfully: " . $stmt->insert_id); // Log successful event addition
        echo json_encode([
            'status' => true, 
            'message' => 'Event added successfully',
            'eventId' => $stmt->insert_id
        ]);
    } else {
        error_log("Database error: " . $stmt->error); // Log database error
        throw new Exception('Failed to add event: ' . $stmt->error, 500);
    }
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'status' => false,
        'message' => $e->getMessage()
    ]);
}
?>
