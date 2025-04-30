<?php
require_once 'cors.php';
require_once 'config.php';

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['userId'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Please login.']);
    exit;
}

// Optionally, check if user is admin here

try {
    // Fetch recent 5 product additions
    $recentProductsQuery = "
        SELECT p.id, p.name, p.created_at, u.name AS seller_name
        FROM products p
        JOIN users u ON p.seller_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 5
    ";
    $stmt = $conn->prepare($recentProductsQuery);
    $stmt->execute();
    $result = $stmt->get_result();
    $recentProducts = [];
    while ($row = $result->fetch_assoc()) {
        $recentProducts[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'created_at' => $row['created_at'],
            'seller_name' => $row['seller_name']
        ];
    }
    $stmt->close();

    // Fetch recent 5 orders
    $recentOrdersQuery = "
        SELECT o.id, o.total_amount, o.created_at, u.name AS buyer_name
        FROM orders o
        JOIN users u ON o.buyer_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 5
    ";
    $stmt = $conn->prepare($recentOrdersQuery);
    $stmt->execute();
    $result = $stmt->get_result();
    $recentOrders = [];
    while ($row = $result->fetch_assoc()) {
        $recentOrders[] = [
            'id' => $row['id'],
            'total_amount' => $row['total_amount'],
            'created_at' => $row['created_at'],
            'buyer_name' => $row['buyer_name']
        ];
    }
    $stmt->close();

    echo json_encode([
        'success' => true,
        'data' => [
            'recentProducts' => $recentProducts,
            'recentOrders' => $recentOrders
        ]
    ]);
} catch (Exception $e) {
    error_log("Error fetching latest activity: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to fetch latest activity.']);
}
?>
