<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Start the session to access session data
session_start();

// Include your database connection
require_once 'config.php';

// Get JSON input
$inputData = json_decode(file_get_contents("php://input"), true);

// Check if required fields are provided
if (empty($inputData['name']) || empty($inputData['description']) || empty($inputData['event_date']) || empty($inputData['location']) || empty($inputData['price']) || empty($inputData['available_tickets']) || empty($inputData['image_url'])) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required.'
    ]);
    exit;
}

// Check if the user is logged in by validating the session
if (!isset($_SESSION['user'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User is not logged in. Please log in first.'
    ]);
    exit;
}

// Retrieve seller_id (user id) from the session
$seller_id = $_SESSION['user']['id'];

// Prepare the event data from the input
$name = $inputData['name'];
$description = $inputData['description'];
$event_date = $inputData['event_date'];
$location = $inputData['location'];
$price = $inputData['price'];
$available_tickets = $inputData['available_tickets'];
$image_url = $inputData['image_url'];

// Prepare the SQL query to insert the event
$stmt = $conn->prepare("INSERT INTO events (seller_id, name, description, event_date, location, price, available_tickets, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to prepare SQL statement.'
    ]);
    exit;
}

// Bind parameters and execute the statement
$stmt->bind_param("issssdis", $seller_id, $name, $description, $event_date, $location, $price, $available_tickets, $image_url);

if ($stmt->execute()) {
    // Success response
    echo json_encode([
        'success' => true,
        'message' => 'Event added successfully.'
    ]);
} else {
    // Failure response
    echo json_encode([
        'success' => false,
        'message' => 'Failed to add event.'
    ]);
}

// Close the statement
$stmt->close();

?>
