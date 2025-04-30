<?php
require_once 'cors.php';
require_once 'config.php';

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['userId'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Please login.']);
    exit;
}

$userId = $_SESSION['userId'];
$statusFilter = isset($_GET['status']) ? $_GET['status'] : null;

try {
    $query = "SELECT o.id AS order_id, o.order_type, o.total_amount, o.status, o.created_at,
                     oi.product_id, oi.event_id, oi.quantity, oi.price,
                     p.name AS product_name, p.image_url AS product_image_url,
                     e.name AS event_name, e.image_url AS event_image_url,
                     ois.status AS item_status, ois.updated_at AS status_updated_at
              FROM orders o
              JOIN order_items oi ON o.id = oi.order_id
              JOIN order_item_status ois ON oi.id = ois.order_item_id
              LEFT JOIN products p ON oi.product_id = p.id
              LEFT JOIN events e ON oi.event_id = e.id
              WHERE o.buyer_id = ?";

    if ($statusFilter) {
        $query .= " AND ois.status = ?";
    }

    $query .= " ORDER BY ois.updated_at DESC";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    if ($statusFilter) {
        $stmt->bind_param("is", $_SESSION['userId'], $statusFilter);
    } else {
        $stmt->bind_param("i", $_SESSION['userId']);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orderId = $row['order_id'];
        if (!isset($orders[$orderId])) {
            $orders[$orderId] = [
                'order_id' => $orderId,
                'order_type' => $row['order_type'],
                'total_amount' => $row['total_amount'],
                'status' => $row['item_status'], // use item_status from order_item_status
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
        $orders[$orderId]['items'][] = $item;
    }

    $stmt->close();

    echo json_encode(['success' => true, 'orders' => array_values($orders)]);
} catch (Exception $e) {
    error_log("Error fetching orders: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to fetch orders.']);
}
?>
