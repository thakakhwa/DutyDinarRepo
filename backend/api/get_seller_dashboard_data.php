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
    // Total Sales: sum of total_amount for orders containing seller's products or events
    $totalSalesQuery = "
        SELECT IFNULL(SUM(o.total_amount), 0) AS total_sales
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN events e ON oi.event_id = e.id
        WHERE (p.seller_id = ? OR e.seller_id = ?)
          AND o.status IN ('pending', 'processing', 'shipped', 'delivered')
    ";
    $stmt = $conn->prepare($totalSalesQuery);
    $stmt->bind_param("ii", $sellerId, $sellerId);
    $stmt->execute();
    $result = $stmt->get_result();
    $totalSales = 0;
    if ($row = $result->fetch_assoc()) {
        $totalSales = $row['total_sales'];
    }
    $stmt->close();

    // Active Orders: count of orders with status pending or processing for seller's products/events
    $activeOrdersQuery = "
        SELECT COUNT(DISTINCT o.id) AS active_orders
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN events e ON oi.event_id = e.id
        WHERE (p.seller_id = ? OR e.seller_id = ?)
          AND o.status IN ('pending', 'processing')
    ";
    $stmt = $conn->prepare($activeOrdersQuery);
    $stmt->bind_param("ii", $sellerId, $sellerId);
    $stmt->execute();
    $result = $stmt->get_result();
    $activeOrders = 0;
    if ($row = $result->fetch_assoc()) {
        $activeOrders = $row['active_orders'];
    }
    $stmt->close();

    // Recent Orders: fetch last 5 orders for seller's products/events
    $recentOrdersQuery = "
        SELECT o.id AS order_id, o.order_type, o.total_amount, o.status, o.created_at,
               oi.product_id, oi.event_id, oi.quantity, oi.price,
               p.name AS product_name, p.image_url AS product_image_url,
               e.name AS event_name, e.image_url AS event_image_url
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN events e ON oi.event_id = e.id
        WHERE (p.seller_id = ? OR e.seller_id = ?)
        ORDER BY o.created_at DESC
        LIMIT 5
    ";
    $stmt = $conn->prepare($recentOrdersQuery);
    $stmt->bind_param("ii", $sellerId, $sellerId);
    $stmt->execute();
    $result = $stmt->get_result();

    $recentOrders = [];
    while ($row = $result->fetch_assoc()) {
        $orderId = $row['order_id'];
        if (!isset($recentOrders[$orderId])) {
            $recentOrders[$orderId] = [
                'order_id' => $orderId,
                'order_type' => $row['order_type'],
                'total_amount' => $row['total_amount'],
                'status' => $row['status'],
                'created_at' => $row['created_at'],
                'items' => []
            ];
        }
        $item = [
            'product_id' => $row['product_id'],
            'event_id' => $row['event_id'],
            'quantity' => $row['quantity'],
            'price' => $row['price'],
            'product_name' => $row['product_name'],
            'product_image_url' => $row['product_image_url'],
            'event_name' => $row['event_name'],
            'event_image_url' => $row['event_image_url']
        ];
        $recentOrders[$orderId]['items'][] = $item;
    }
    $stmt->close();

    // Upcoming Events: fetch events by seller with event_date in the future, limit 5
    $upcomingEventsQuery = "
        SELECT id, name, event_date, location, price, image_url
        FROM events
        WHERE seller_id = ? AND event_date > NOW()
        ORDER BY event_date ASC
        LIMIT 5
    ";
    $stmt = $conn->prepare($upcomingEventsQuery);
    $stmt->bind_param("i", $sellerId);
    $stmt->execute();
    $result = $stmt->get_result();

    $upcomingEvents = [];
    while ($row = $result->fetch_assoc()) {
        $upcomingEvents[] = $row;
    }
    $stmt->close();

    // Product Views: Placeholder value as no tracking data available
    $productViews = 0;

    echo json_encode([
        'success' => true,
        'totalSales' => $totalSales,
        'activeOrders' => $activeOrders,
        'recentOrders' => array_values($recentOrders),
        'upcomingEvents' => $upcomingEvents,
        'productViews' => $productViews
    ]);
} catch (Exception $e) {
    error_log("Error fetching seller dashboard data: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to fetch seller dashboard data.']);
}
?>
