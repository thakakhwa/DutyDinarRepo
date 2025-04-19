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

$wishlistId = isset($data['id']) ? intval($data['id']) : null;

if (!$wishlistId) {
    echo json_encode(['success' => false, 'message' => 'Missing wishlist item id']);
    exit;
}

try {
    $deleteSql = "DELETE FROM wishlist WHERE id = ? AND buyer_id = ?";
    $stmt = $conn->prepare($deleteSql);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    $stmt->bind_param("ii", $wishlistId, $userId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Wishlist item not found or unauthorized']);
    }
    $stmt->close();
} catch (Exception $e) {
    error_log("Error removing from wishlist: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to remove from wishlist.']);
}
?>
