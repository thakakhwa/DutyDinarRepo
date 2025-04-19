<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/book_event_error.log');

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php'; // Database connection

session_start();

function check_authentication() {
    if (!isset($_SESSION['userId'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized: No active session']);
        exit;
    }
    return ['id' => $_SESSION['userId']];
}

try {
    $user = check_authentication();
    $user_id = $user['id'];

    $inputData = json_decode(file_get_contents("php://input"), true);

    if (empty($inputData['event_id']) || empty($inputData['quantity'])) {
        echo json_encode(['success' => false, 'message' => 'Event ID and quantity are required.']);
        exit;
    }

    $event_id = (int)$inputData['event_id'];
    $quantity = (int)$inputData['quantity'];

    // Check event availability and price
    $event_stmt = $conn->prepare("SELECT price, available_tickets FROM events WHERE id = ?");
    if (!$event_stmt) {
        echo json_encode(['success' => false, 'message' => 'Failed to prepare event query.']);
        exit;
    }
    $event_stmt->bind_param("i", $event_id);
    $event_stmt->execute();
    $event_result = $event_stmt->get_result();
    if ($event_result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Event not found.']);
        exit;
    }
    $event = $event_result->fetch_assoc();
    $price = (float)$event['price'];
    $available_tickets = (int)$event['available_tickets'];
    $event_stmt->close();

    if ($quantity > $available_tickets) {
        echo json_encode(['success' => false, 'message' => 'Not enough tickets available.']);
        exit;
    }

    // Start transaction
    $conn->begin_transaction();

    // Insert into orders table
    $order_stmt = $conn->prepare("INSERT INTO orders (buyer_id, order_type, total_amount, status) VALUES (?, 'event', ?, 'pending')");
    if (!$order_stmt) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Failed to prepare order insert.']);
        exit;
    }
    $total_amount = $price * $quantity;
    $order_stmt->bind_param("id", $user_id, $total_amount);
    if (!$order_stmt->execute()) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Failed to create order.']);
        exit;
    }
    $order_id = $conn->insert_id;
    $order_stmt->close();

    // Insert into order_items table
    $item_stmt = $conn->prepare("INSERT INTO order_items (order_id, event_id, quantity, price) VALUES (?, ?, ?, ?)");
    if (!$item_stmt) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Failed to prepare order item insert.']);
        exit;
    }
    $item_stmt->bind_param("iiid", $order_id, $event_id, $quantity, $price);
    if (!$item_stmt->execute()) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Failed to add order item.']);
        exit;
    }
    $item_stmt->close();

    // Update available tickets
    $update_stmt = $conn->prepare("UPDATE events SET available_tickets = available_tickets - ? WHERE id = ?");
    if (!$update_stmt) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Failed to prepare tickets update.']);
        exit;
    }
    $update_stmt->bind_param("ii", $quantity, $event_id);
    if (!$update_stmt->execute()) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Failed to update tickets.']);
        exit;
    }
    $update_stmt->close();

    // Check if user already booked this event
    $check_stmt = $conn->prepare("SELECT quantity FROM event_bookings WHERE user_id = ? AND event_id = ?");
    if (!$check_stmt) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Failed to prepare booking check.']);
        exit;
    }
    $check_stmt->bind_param("ii", $user_id, $event_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    if ($check_result && $check_result->num_rows > 0) {
        $check_row = $check_result->fetch_assoc();
        if ((int)$check_row['quantity'] >= 1) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'You have already booked a ticket for this event.']);
            exit;
        }
    }
    $check_stmt->close();

    // Insert booking record with quantity 1
    $booking_stmt = $conn->prepare("INSERT INTO event_bookings (user_id, event_id, quantity) VALUES (?, ?, 1)");
    if (!$booking_stmt) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Failed to prepare event booking insert.']);
        exit;
    }
    $booking_stmt->bind_param("ii", $user_id, $event_id);
    if (!$booking_stmt->execute()) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Failed to insert event booking.']);
        exit;
    }
    $booking_stmt->close();

    $conn->commit();

    echo json_encode(['success' => true, 'message' => 'Event booked successfully.', 'order_id' => $order_id]);

} catch (Exception $e) {
    $conn->rollback();
    error_log("Book Event API error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Internal server error.']);
}
?>
