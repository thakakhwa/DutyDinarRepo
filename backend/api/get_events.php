<?php
// Ensure no output before headers
if (headers_sent($file, $line)) {
    die("Headers already sent in $file on line $line");
}

// Force CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle OPTIONS (Preflight) request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Now include config and run the query
require_once 'config.php';

function json_response($success, $message, $data = null) {
    http_response_code($success ? 200 : 500);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

try {
    if (!$conn) {
        throw new Exception("Database connection failed: " . mysqli_connect_error());
    }

    $query = "SELECT id, seller_id, name, description, event_date, location, price, available_tickets, image_url FROM events ORDER BY event_date ASC";
    $result = $conn->query($query);

    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }

    $events = [];
    while ($row = $result->fetch_assoc()) {
        $events[] = $row;
    }

    json_response(true, "Events fetched", ['events' => $events]);

} catch (Exception $e) {
    json_response(false, "Server Error: " . $e->getMessage());
}