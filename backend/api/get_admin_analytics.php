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
    // Total revenue and revenue growth (last month vs previous month)
    $totalRevenueQuery = "SELECT SUM(total_amount) AS total_revenue FROM orders";
    $stmt = $conn->prepare($totalRevenueQuery);
    $stmt->execute();
    $result = $stmt->get_result();
    $totalRevenue = 0;
    if ($row = $result->fetch_assoc()) {
        $totalRevenue = floatval($row['total_revenue']);
    }
    $stmt->close();

    // Total orders and orders growth (last month vs previous month)
    $totalOrdersQuery = "SELECT COUNT(*) AS total_orders FROM orders";
    $stmt = $conn->prepare($totalOrdersQuery);
    $stmt->execute();
    $result = $stmt->get_result();
    $totalOrders = 0;
    if ($row = $result->fetch_assoc()) {
        $totalOrders = intval($row['total_orders']);
    }
    $stmt->close();

    // Total users and users growth (last month vs previous month)
    $totalUsersQuery = "SELECT COUNT(*) AS total_users FROM users";
    $stmt = $conn->prepare($totalUsersQuery);
    $stmt->execute();
    $result = $stmt->get_result();
    $totalUsers = 0;
    if ($row = $result->fetch_assoc()) {
        $totalUsers = intval($row['total_users']);
    }
    $stmt->close();

    // Monthly revenue for last 6 months
    $monthlyRevenueQuery = "
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(total_amount) AS revenue
        FROM orders
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY month
        ORDER BY month ASC
    ";
    $stmt = $conn->prepare($monthlyRevenueQuery);
    $stmt->execute();
    $result = $stmt->get_result();
    $monthlyRevenue = [];
    while ($row = $result->fetch_assoc()) {
        $monthlyRevenue[$row['month']] = floatval($row['revenue']);
    }
    $stmt->close();

    // Top products by sales count and revenue
    $topProductsQuery = "
        SELECT p.name, SUM(oi.quantity) AS sales, SUM(oi.price * oi.quantity) AS amount
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        GROUP BY p.id
        ORDER BY sales DESC
        LIMIT 5
    ";
    $stmt = $conn->prepare($topProductsQuery);
    $stmt->execute();
    $result = $stmt->get_result();
    $topProducts = [];
    while ($row = $result->fetch_assoc()) {
        $topProducts[] = [
            'name' => $row['name'],
            'sales' => intval($row['sales']),
            'amount' => floatval($row['amount'])
        ];
    }
    $stmt->close();

    // Top countries - Not available in DB, so return empty array
    $topCountries = [];

    echo json_encode([
        'success' => true,
        'data' => [
            'totalRevenue' => $totalRevenue,
            'totalOrders' => $totalOrders,
            'totalUsers' => $totalUsers,
            'monthlyRevenue' => $monthlyRevenue,
            'topProducts' => $topProducts,
            'topCountries' => $topCountries
        ]
    ]);
} catch (Exception $e) {
    error_log("Error fetching admin analytics: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to fetch admin analytics.']);
}
?>
