<?php
// Ensure no output before headers
if (headers_sent($file, $line)) {
    die("Headers already sent in $file on line $line");
}

// Force CORS headers
require_once 'cors.php';
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");
session_start();

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

    if (!isset($_SESSION['userId'])) {
        json_response(false, "User not logged in");
    }

    $user_id = $_SESSION['userId'];

    $stmt = $conn->prepare("
        SELECT e.id, e.seller_id, e.name, e.description, e.event_date, e.location, e.price, e.available_tickets, e.image_url, eb.quantity, eb.booking_date
        FROM event_bookings eb
        JOIN events e ON eb.event_id = e.id
        WHERE eb.user_id = ?
        ORDER BY eb.booking_date DESC
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }

    $booked_events = [];
    while ($row = $result->fetch_assoc()) {
        $booked_events[] = $row;
    }

    json_response(true, "Booked events fetched", ['booked_events' => $booked_events]);
} catch (Exception $e) {
    json_response(false, "Server Error: " . $e->getMessage());
}
