<?php
require_once 'cors.php';
session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

if (!isset($_SESSION['userId']) || !isset($_SESSION['userType']) || !in_array($_SESSION['userType'], ['buyer', 'seller'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Only buyers or sellers can add reviews']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['product_id'], $data['rating'], $data['comment'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$product_id = intval($data['product_id']);
$rating = intval($data['rating']);
$comment = trim($data['comment']);
$user_id = intval($_SESSION['userId']);
$userType = $_SESSION['userType'];

if ($rating < 1 || $rating > 5) {
    echo json_encode(['success' => false, 'message' => 'Rating must be between 1 and 5']);
    exit;
}

if (empty($comment)) {
    echo json_encode(['success' => false, 'message' => 'Comment cannot be empty']);
    exit;
}

require_once '../controller/connection.php';

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$sql = "INSERT INTO reviews (user_id, userType, product_id, rating, comment) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Failed to prepare statement']);
    exit;
}

$stmt->bind_param('isiss', $user_id, $userType, $product_id, $rating, $comment);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Review added successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add review']);
}

$stmt->close();
$conn->close();
?>
