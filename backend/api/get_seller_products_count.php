<?php
require_once 'cors.php';
require_once 'config.php';

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['userId'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Please login.']);
    exit;
}

$sellerId = $_SESSION['userId'];

try {
    $query = "SELECT COUNT(*) AS product_count FROM products WHERE seller_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $sellerId);
    $stmt->execute();
    $result = $stmt->get_result();
    $productCount = 0;
    if ($row = $result->fetch_assoc()) {
        $productCount = $row['product_count'];
    }
    $stmt->close();

    echo json_encode(['success' => true, 'product_count' => $productCount]);
} catch (Exception $e) {
    error_log("Error fetching seller products count: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to fetch product count']);
}
?>
