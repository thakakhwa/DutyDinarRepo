<?php
require_once 'cors.php';
require_once 'config.php';

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['userId'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Please login.']);
    exit;
}

$buyerId = $_SESSION['userId'];

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['order_type']) || !isset($data['items']) || !is_array($data['items']) || count($data['items']) === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid order data']);
    exit;
}

$orderType = $data['order_type'];
$items = $data['items']; // array of {product_id or event_id, quantity, price}
$paymentMethod = isset($data['payment_method']) ? $data['payment_method'] : null;

$totalAmount = 0;
foreach ($items as $item) {
    if (!isset($item['quantity']) || !isset($item['price'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid item data']);
        exit;
    }
    $totalAmount += $item['quantity'] * $item['price'];
}

$conn->begin_transaction();

try {
    // Insert into orders table
    $insertOrderQuery = "INSERT INTO orders (buyer_id, order_type, total_amount, status, created_at, updated_at) VALUES (?, ?, ?, 'pending', NOW(), NOW())";
    $stmt = $conn->prepare($insertOrderQuery);
    $stmt->bind_param("isd", $buyerId, $orderType, $totalAmount);
    $stmt->execute();
    $orderId = $stmt->insert_id;
    $stmt->close();

    // Insert order items with seller_id and insert initial status in order_item_status
    $insertItemQuery = "INSERT INTO order_items (order_id, seller_id, product_id, event_id, quantity, price) VALUES (?, ?, ?, ?, ?, ?)";
    $stmtItem = $conn->prepare($insertItemQuery);

    $insertStatusQuery = "INSERT INTO order_item_status (order_item_id, status) VALUES (?, 'pending')";
    $stmtStatus = $conn->prepare($insertStatusQuery);

    foreach ($items as $item) {
        $productId = isset($item['product_id']) ? $item['product_id'] : null;
        $eventId = isset($item['event_id']) ? $item['event_id'] : null;
        $quantity = $item['quantity'];
        $price = $item['price'];

        // Fetch seller_id from products or events
        $sellerId = null;
        if ($productId !== null) {
            $querySeller = "SELECT seller_id FROM products WHERE id = ?";
            $stmtSeller = $conn->prepare($querySeller);
            $stmtSeller->bind_param("i", $productId);
            $stmtSeller->execute();
            $resultSeller = $stmtSeller->get_result();
            if ($rowSeller = $resultSeller->fetch_assoc()) {
                $sellerId = $rowSeller['seller_id'];
            }
            $stmtSeller->close();
        } elseif ($eventId !== null) {
            $querySeller = "SELECT seller_id FROM events WHERE id = ?";
            $stmtSeller = $conn->prepare($querySeller);
            $stmtSeller->bind_param("i", $eventId);
            $stmtSeller->execute();
            $resultSeller = $stmtSeller->get_result();
            if ($rowSeller = $resultSeller->fetch_assoc()) {
                $sellerId = $rowSeller['seller_id'];
            }
            $stmtSeller->close();
        }

        $stmtItem->bind_param("iiiiid", $orderId, $sellerId, $productId, $eventId, $quantity, $price);
        $stmtItem->execute();

        $orderItemId = $stmtItem->insert_id;

        $stmtStatus->bind_param("i", $orderItemId);
        $stmtStatus->execute();
    }
    $stmtItem->close();
    $stmtStatus->close();

    // Insert payment record if payment_method provided
    if ($paymentMethod !== null) {
        $paymentStatus = ($paymentMethod === 'visa') ? 'completed' : 'pending';
        $insertPaymentQuery = "INSERT INTO payments (order_id, payment_method, amount, status, created_at) VALUES (?, ?, ?, ?, NOW())";
        $stmtPayment = $conn->prepare($insertPaymentQuery);
        $stmtPayment->bind_param("isds", $orderId, $paymentMethod, $totalAmount, $paymentStatus);
        $stmtPayment->execute();
        $stmtPayment->close();
    }

    $conn->commit();

    echo json_encode(['success' => true, 'order_id' => $orderId]);
} catch (Exception $e) {
    $conn->rollback();
    error_log("Error creating order: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to create order']);
}
?>
