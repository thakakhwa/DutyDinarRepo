<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'cors.php';
require_once 'config.php';

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['userId'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Please login.']);
    exit;
}

$userId = $_SESSION['userId'];

$data = json_decode(file_get_contents('php://input'), true);

$productId = isset($data['product_id']) ? intval($data['product_id']) : null;
$eventId = isset($data['event_id']) ? intval($data['event_id']) : null;

if (!$productId && !$eventId) {
    echo json_encode(['success' => false, 'message' => 'Missing product_id or event_id']);
    exit;
}

try {
    // Check if already in wishlist
    $checkSql = "SELECT id FROM wishlist WHERE buyer_id = ? AND product_id <=> ? AND event_id <=> ?";
    $stmtCheck = $conn->prepare($checkSql);
    if (!$stmtCheck) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    $stmtCheck->bind_param("iii", $userId, $productId, $eventId);
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();
    if ($resultCheck->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Item already in wishlist']);
        exit;
    }
    $stmtCheck->close();

    $insertSql = "INSERT INTO wishlist (buyer_id, product_id, event_id) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($insertSql);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    $stmt->bind_param("iii", $userId, $productId, $eventId);
    $stmt->execute();

    $insertedId = $stmt->insert_id;
    $stmt->close();

    echo json_encode(['success' => true, 'data' => ['id' => $insertedId]]);
} catch (Exception $e) {
    error_log("Error adding to wishlist: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to add to wishlist.']);
}
?>
