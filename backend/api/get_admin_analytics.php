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
    
    // Monthly orders for last 6 months
    $monthlyOrdersQuery = "
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS order_count
        FROM orders
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY month
        ORDER BY month ASC
    ";
    $stmt = $conn->prepare($monthlyOrdersQuery);
    $stmt->execute();
    $result = $stmt->get_result();
    $monthlyOrders = [];
    while ($row = $result->fetch_assoc()) {
        $monthlyOrders[$row['month']] = intval($row['order_count']);
    }
    $stmt->close();
    
    // Monthly users for last 6 months
    $monthlyUsersQuery = "
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS user_count
        FROM users
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY month
        ORDER BY month ASC
    ";
    $stmt = $conn->prepare($monthlyUsersQuery);
    $stmt->execute();
    $result = $stmt->get_result();
    $monthlyUsers = [];
    while ($row = $result->fetch_assoc()) {
        $monthlyUsers[$row['month']] = intval($row['user_count']);
    }
    $stmt->close();

    // Top products by sales count and revenue
    $topProductsQuery = "
        SELECT p.name, SUM(oi.quantity) AS sales, SUM(oi.price * oi.quantity) AS amount
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.product_id IS NOT NULL
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

    // Top events by bookings and revenue
    $topEventsQuery = "
        SELECT e.name, COUNT(eb.id) AS sales, SUM(oi.price) AS amount
        FROM events e
        LEFT JOIN event_bookings eb ON e.id = eb.event_id
        LEFT JOIN order_items oi ON e.id = oi.event_id
        GROUP BY e.id
        ORDER BY sales DESC
        LIMIT 5
    ";
    $stmt = $conn->prepare($topEventsQuery);
    $stmt->execute();
    $result = $stmt->get_result();
    $topEvents = [];
    while ($row = $result->fetch_assoc()) {
        $topEvents[] = [
            'name' => $row['name'],
            'sales' => intval($row['sales']),
            'amount' => floatval($row['amount']) ?: 0
        ];
    }
    $stmt->close();

    echo json_encode([
        'success' => true,
        'data' => [
            'totalRevenue' => $totalRevenue,
            'totalOrders' => $totalOrders,
            'totalUsers' => $totalUsers,
            'monthlyRevenue' => $monthlyRevenue,
            'monthlyOrders' => $monthlyOrders,
            'monthlyUsers' => $monthlyUsers,
            'topProducts' => $topProducts,
            'topEvents' => $topEvents
        ]
    ]);
} catch (Exception $e) {
    error_log("Error fetching admin analytics: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to fetch admin analytics.']);
}
?>
