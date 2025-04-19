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

try {
    $stmt = $conn->prepare("SELECT w.id as wishlist_id, p.id, p.name, p.description, p.price, p.stock, p.category, p.image_url FROM wishlist w JOIN products p ON w.product_id = p.id WHERE w.buyer_id = ?");
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $favorites = [];
    while ($row = $result->fetch_assoc()) {
        $favorites[] = $row;
    }
    $stmt->close();

    echo json_encode(['success' => true, 'favorites' => $favorites]);
} catch (Exception $e) {
    error_log("Error fetching favorites: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to fetch favorites.']);
}
?>
