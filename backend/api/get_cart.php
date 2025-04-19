<?php
require_once 'cors.php';
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['userId'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized: No active session']);
    exit;
}

require_once 'config.php';

$userId = $_SESSION['userId'];

// Debug log for userId
error_log("get_cart.php called for userId: " . $userId);

// Fetch cart items for the user
$stmt = $conn->prepare("
    SELECT 
        c.id AS id,
        c.product_id,
        c.event_id,
        SUM(c.quantity) AS quantity,
        p.name AS product_name,
        p.price AS product_price,
        p.image_url AS product_image_url,
        NULL AS event_name,
        NULL AS event_price,
        NULL AS event_image_url
    FROM cart c
    INNER JOIN products p ON c.product_id = p.id
    WHERE c.buyer_id = ?
    GROUP BY c.product_id
");
if (!$stmt) {
    $errorMsg = 'Database error: ' . $conn->error;
    error_log("get_cart.php prepare statement error: " . $errorMsg);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $errorMsg]);
    exit;
}

$stmt->bind_param("i", $userId);

if (!$stmt->execute()) {
    $errorMsg = 'Execute failed: ' . $stmt->error;
    error_log("get_cart.php execute error: " . $errorMsg);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $errorMsg]);
    exit;
}

$result = $stmt->get_result();

if (!$result) {
    $errorMsg = 'Get result failed: ' . $stmt->error;
    error_log("get_cart.php get_result error: " . $errorMsg);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $errorMsg]);
    exit;
}

$cartItems = [];
while ($row = $result->fetch_assoc()) {
    $cartItems[] = $row;
}

 
// Fetch event cart items
$eventStmt = $conn->prepare("
    SELECT 
        c.id AS id,
        c.product_id,
        c.event_id,
        SUM(c.quantity) AS quantity,
        NULL AS product_name,
        NULL AS product_price,
        NULL AS product_image_url,
        e.name AS event_name,
        e.price AS event_price,
        e.image_url AS event_image_url
    FROM cart c
    INNER JOIN events e ON c.event_id = e.id
    WHERE c.buyer_id = ? AND c.event_id IS NOT NULL
    GROUP BY c.event_id
");

if (!$eventStmt) {
    $errorMsg = 'Database error: ' . $conn->error;
    error_log("get_cart.php event prepare statement error: " . $errorMsg);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $errorMsg]);
    exit;
}

$eventStmt->bind_param("i", $userId);

if (!$eventStmt->execute()) {
    $errorMsg = 'Execute failed: ' . $eventStmt->error;
    error_log("get_cart.php event execute error: " . $errorMsg);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $errorMsg]);
    exit;
}

$eventResult = $eventStmt->get_result();

if (!$eventResult) {
    $errorMsg = 'Get result failed: ' . $eventStmt->error;
    error_log("get_cart.php event get_result error: " . $errorMsg);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $errorMsg]);
    exit;
}

while ($row = $eventResult->fetch_assoc()) {
    $cartItems[] = $row;
}

$eventStmt->close();

$stmt->close();

$conn->close();

echo json_encode(['success' => true, 'data' => $cartItems]);
?>
