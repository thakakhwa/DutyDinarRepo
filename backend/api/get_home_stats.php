<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

try {
    // Get total events
    $eventsQuery = "SELECT COUNT(*) as total FROM events";
    $stmt = $conn->prepare($eventsQuery);
    $stmt->execute();
    $result = $stmt->get_result();
    $totalEvents = 0;
    if ($row = $result->fetch_assoc()) {
        $totalEvents = intval($row['total']);
    }

    // Get total products
    $productsQuery = "SELECT COUNT(*) as total FROM products";
    $stmt = $conn->prepare($productsQuery);
    $stmt->execute();
    $result = $stmt->get_result();
    $totalProducts = 0;
    if ($row = $result->fetch_assoc()) {
        $totalProducts = intval($row['total']);
    }

    // Get total sellers
    $sellersQuery = "SELECT COUNT(*) as total FROM users WHERE userType = 'seller'";
    $stmt = $conn->prepare($sellersQuery);
    $stmt->execute();
    $result = $stmt->get_result();
    $totalSellers = 0;
    if ($row = $result->fetch_assoc()) {
        $totalSellers = intval($row['total']);
    }

    // Get total buyers
    $buyersQuery = "SELECT COUNT(*) as total FROM users WHERE userType = 'buyer'";
    $stmt = $conn->prepare($buyersQuery);
    $stmt->execute();
    $result = $stmt->get_result();
    $totalBuyers = 0;
    if ($row = $result->fetch_assoc()) {
        $totalBuyers = intval($row['total']);
    }

    echo json_encode([
        'success' => true,
        'totalEvents' => $totalEvents,
        'totalProducts' => $totalProducts,
        'totalSellers' => $totalSellers,
        'totalBuyers' => $totalBuyers
    ]);
} catch (Exception $e) {
    error_log("Error fetching home stats: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to fetch statistics.']);
}
?> 