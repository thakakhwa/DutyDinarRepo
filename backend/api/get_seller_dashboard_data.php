<?php
require_once 'cors.php';
require_once 'config.php';
require_once 'session_init.php';

header('Content-Type: application/json');

if (!isset($_SESSION['userId'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Please login.']);
    exit;
}

$sellerId = $_SESSION['userId'];

// Debug log sellerId
error_log("SellerDashboard API called for sellerId: " . $sellerId);

error_log("SellerDashboard API called for sellerId: " . $sellerId);

if (!$conn) {
    error_log("Database connection failed: " . mysqli_connect_error());
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

if (!isset($_SESSION['userId']) || empty($_SESSION['userId'])) {
    error_log("Session userId is not set or empty.");
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Please login.']);
    exit;
}

try {
    // Custom error log file for debugging
    // Enable debug logging to system temp directory
    $debugLogFile = '/tmp/debug_error_log.txt';

    function debug_log($message) {
        global $debugLogFile;
        file_put_contents($debugLogFile, date('Y-m-d H:i:s') . " - " . $message . PHP_EOL, FILE_APPEND);
    }

    debug_log("SellerDashboard API called for sellerId: " . $sellerId);

    // Total Sales: sum of price * quantity for delivered order items for seller
    $totalSalesQuery = "
        SELECT IFNULL(SUM(oi.price * oi.quantity), 0) AS total_sales
        FROM order_items oi
        JOIN order_item_status ois ON oi.id = ois.order_item_id
        WHERE oi.seller_id = ? AND ois.status = 'delivered'
    ";
    $stmt = $conn->prepare($totalSalesQuery);
    if (!$stmt) {
        debug_log("Prepare failed for totalSalesQuery: " . $conn->error);
        throw new Exception("Database query preparation failed.");
    }
    $stmt->bind_param("i", $sellerId);
    if (!$stmt->execute()) {
        debug_log("Execution failed for totalSalesQuery: " . $stmt->error);
        throw new Exception("Database query execution failed.");
    }
    $result = $stmt->get_result();
    $totalSales = 0;
    if ($row = $result->fetch_assoc()) {
        $totalSales = $row['total_sales'];
    }
    $stmt->close();

    // Active Orders: count distinct orders with order items for seller with status pending or processing
    $activeOrdersQuery = "
        SELECT COUNT(DISTINCT oi.order_id) AS active_orders
        FROM order_items oi
        JOIN order_item_status ois ON oi.id = ois.order_item_id
        WHERE oi.seller_id = ? AND ois.status IN ('pending', 'processing')
    ";
    $stmt = $conn->prepare($activeOrdersQuery);
    if (!$stmt) {
        error_log("Prepare failed for activeOrdersQuery: " . $conn->error);
        throw new Exception("Database query preparation failed.");
    }
    $stmt->bind_param("i", $sellerId);
    if (!$stmt->execute()) {
        error_log("Execution failed for activeOrdersQuery: " . $stmt->error);
        throw new Exception("Database query execution failed.");
    }
    $result = $stmt->get_result();
    $activeOrders = 0;
    if ($row = $result->fetch_assoc()) {
        $activeOrders = $row['active_orders'];
    }
    $stmt->close();

    // Recent Orders: updated query to include all accessed columns with proper LEFT JOINs
    $recentOrdersQuery = "
        SELECT o.id AS order_id, o.order_type, o.total_amount, o.status AS order_status, o.created_at,
               oi.product_id, oi.event_id, oi.quantity, oi.price,
               p.name AS product_name, p.image_url AS product_image_url,
               e.name AS event_name, e.image_url AS event_image_url,
               ois.status AS item_status, ois.updated_at AS status_updated_at,
               u.name AS customer_name
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id AND oi.seller_id = ?
        JOIN order_item_status ois ON oi.id = ois.order_item_id
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN events e ON oi.event_id = e.id
        LEFT JOIN users u ON o.buyer_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 5
    ";
    $stmt = $conn->prepare($recentOrdersQuery);
    if (!$stmt) {
        error_log("Prepare failed for recentOrdersQuery: " . $conn->error);
        throw new Exception("Database query preparation failed.");
    }
    $stmt->bind_param("i", $sellerId);
    if (!$stmt->execute()) {
        error_log("Execution failed for recentOrdersQuery: " . $stmt->error);
        throw new Exception("Database query execution failed.");
    }
    $result = $stmt->get_result();

    $recentOrders = [];
    $firstRow = $result->fetch_assoc();
    if ($firstRow) {
        error_log("RecentOrders first row keys: " . implode(", ", array_keys($firstRow)));
        $orderId = $firstRow['order_id'];
        $recentOrders[$orderId] = [
            'order_id' => $orderId,
            'order_type' => $firstRow['order_type'],
            'total_amount' => $firstRow['total_amount'],
            'status' => $firstRow['item_status'], // use item_status from order_item_status
            'created_at' => $firstRow['created_at'],
            'customer_name' => $firstRow['customer_name'],
            'items' => []
        ];
        $item = [
            'product_id' => $firstRow['product_id'],
            'event_id' => $firstRow['event_id'],
            'quantity' => $firstRow['quantity'],
            'price' => $firstRow['price'],
            'product_name' => $firstRow['product_name'],
            'product_image_url' => $firstRow['product_image_url'],
            'event_name' => $firstRow['event_name'],
            'event_image_url' => $firstRow['event_image_url']
        ];
        $recentOrders[$orderId]['items'][] = $item;

        while ($row = $result->fetch_assoc()) {
            $orderId = $row['order_id'];
            if (!isset($recentOrders[$orderId])) {
                $recentOrders[$orderId] = [
                    'order_id' => $orderId,
                    'order_type' => $row['order_type'],
                    'total_amount' => $row['total_amount'],
                    'status' => $row['item_status'], // use item_status from order_item_status
                    'created_at' => $row['created_at'],
                    'customer_name' => $row['customer_name'],
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
    }
    $stmt->close();

    // Debug log count of recent orders fetched
    error_log("SellerDashboard API recentOrders count: " . count($recentOrders));

    // Upcoming Events: fetch events by seller with event_date in the future, limit 5
    $upcomingEventsQuery = "
        SELECT id, name, event_date, location, image_url
        FROM events
        WHERE seller_id = ? AND event_date > NOW()
        ORDER BY event_date ASC
        LIMIT 5
    ";
    $stmt = $conn->prepare($upcomingEventsQuery);
    if (!$stmt) {
        error_log("Prepare failed for upcomingEventsQuery: " . $conn->error);
        throw new Exception("Database query preparation failed.");
    }
    $stmt->bind_param("i", $sellerId);
    if (!$stmt->execute()) {
        error_log("Execution failed for upcomingEventsQuery: " . $stmt->error);
        throw new Exception("Database query execution failed.");
    }
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
