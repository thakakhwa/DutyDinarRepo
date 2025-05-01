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

    $event_id = isset($_GET['id']) ? intval($_GET['id']) : null;
    $myEvents = isset($_GET['myEvents']) ? $_GET['myEvents'] === 'true' : false;
    $sellerId = isset($_GET['seller_id']) ? intval($_GET['seller_id']) : null;

    error_log("get_events.php called with myEvents: " . ($myEvents ? "true" : "false") . ", seller_id: " . $sellerId);

    if ($event_id) {
        $stmt = $conn->prepare("SELECT id, seller_id, name, description, event_date, location, available_tickets, image_url FROM events WHERE id = ?");
        $stmt->bind_param("i", $event_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if (!$result) {
            throw new Exception("Query failed: " . $conn->error);
        }

        $event = $result->fetch_assoc();

        if (!$event) {
            json_response(false, "Event not found");
        }

        // Add booking status if user logged in
        $booked_quantity = 0;
        if (isset($_SESSION['userId'])) {
            $user_id = $_SESSION['userId'];
            $booking_stmt = $conn->prepare("SELECT quantity FROM event_bookings WHERE user_id = ? AND event_id = ?");
            if ($booking_stmt) {
                $booking_stmt->bind_param("ii", $user_id, $event_id);
                $booking_stmt->execute();
                $booking_result = $booking_stmt->get_result();
                if ($booking_result && $booking_result->num_rows > 0) {
                    $booking_row = $booking_result->fetch_assoc();
                    $booked_quantity = (int)$booking_row['quantity'];
                }
                $booking_stmt->close();
            }
        }
        $event['booked_quantity'] = $booked_quantity;

        json_response(true, "Event fetched", ['events' => [$event]]);
    } elseif ($myEvents && $sellerId) {
        $stmt = $conn->prepare("SELECT id, seller_id, name, description, event_date, location, available_tickets, image_url FROM events WHERE seller_id = ? ORDER BY event_date ASC");
        $stmt->bind_param("i", $sellerId);
        $stmt->execute();
        $result = $stmt->get_result();

        if (!$result) {
            throw new Exception("Query failed: " . $conn->error);
        }

        $events = [];
        while ($row = $result->fetch_assoc()) {
            $events[] = $row;
        }

        error_log("Number of events fetched: " . count($events));

        json_response(true, "Events fetched", ['events' => $events]);
    } else {
        $query = "SELECT id, seller_id, name, description, event_date, location, available_tickets, image_url FROM events ORDER BY event_date ASC";
        $result = $conn->query($query);

        if (!$result) {
            throw new Exception("Query failed: " . $conn->error);
        }

        $events = [];
        while ($row = $result->fetch_assoc()) {
            $events[] = $row;
        }

        json_response(true, "Events fetched", ['events' => $events]);
    }
} catch (Exception $e) {
    json_response(false, "Server Error: " . $e->getMessage());
}
