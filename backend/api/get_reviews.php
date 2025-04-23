<?php
require_once 'cors.php';
require_once 'config.php'; // Database connection

session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

if (!isset($_GET['product_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing product_id parameter']);
    exit;
}

$product_id = intval($_GET['product_id']);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$sql = "SELECT r.rating, r.comment, r.created_at, u.email AS username 
        FROM reviews r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.product_id = ? 
        ORDER BY r.created_at DESC";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log("Prepare failed: " . $conn->error);
    echo json_encode(['success' => false, 'message' => 'Failed to prepare statement']);
    exit;
}

$stmt->bind_param('i', $product_id);

if (!$stmt->execute()) {
    error_log("Execute failed: " . $stmt->error);
    echo json_encode(['success' => false, 'message' => 'Failed to execute query']);
    exit;
}

$result = $stmt->get_result();

$reviews = [];

while ($row = $result->fetch_assoc()) {
    $reviews[] = [
        'rating' => intval($row['rating']),
        'comment' => $row['comment'],
        'created_at' => $row['created_at'],
        'username' => $row['username'],
    ];
}

$stmt->close();
$conn->close();

echo json_encode(['success' => true, 'reviews' => $reviews]);
?>
