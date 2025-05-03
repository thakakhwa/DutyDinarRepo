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

// Get input data
$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['order_id']) || !isset($data['status'])) {
    echo json_encode(['success' => false, 'message' => 'Missing order_id or status']);
    exit;
}

$orderId = intval($data['order_id']);
$status = $data['status'];

// Validate status
$validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
if (!in_array($status, $validStatuses)) {
    echo json_encode(['success' => false, 'message' => 'Invalid status value']);
    exit;
}

try {
    $conn->begin_transaction();

    // Check if the seller owns any product or event in the order
    $checkQuery = "
        SELECT COUNT(*) AS count
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN events e ON oi.event_id = e.id
        WHERE oi.order_id = ? AND (p.seller_id = ? OR e.seller_id = ?)
    ";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param("iii", $orderId, $sellerId, $sellerId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    if ($row['count'] == 0) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Unauthorized to update this order']);
        exit;
    }
    $stmt->close();

    // Update order_item_status for the specific order item
    $updateStatusQuery = "UPDATE order_item_status ois
                          JOIN order_items oi ON ois.order_item_id = oi.id
                          SET ois.status = ?, ois.updated_at = NOW()
                          WHERE oi.order_id = ? AND oi.seller_id = ?";
    $stmt = $conn->prepare($updateStatusQuery);
    $stmt->bind_param("sii", $status, $orderId, $sellerId);
    $stmt->execute();
    if ($stmt->affected_rows === 0) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Order item status not updated']);
        exit;
    }
    $stmt->close();

    // If status is processing, decrement stock quantity of products in the order
    if ($status === 'processing' || $status === 'cancelled') {
        // Get product_id and quantity for the order and seller
        $productQuery = "SELECT product_id, quantity FROM order_items WHERE order_id = ? AND seller_id = ? AND product_id IS NOT NULL";
        $stmtProd = $conn->prepare($productQuery);
        $stmtProd->bind_param("ii", $orderId, $sellerId);
        $stmtProd->execute();
        $resultProd = $stmtProd->get_result();

        while ($rowProd = $resultProd->fetch_assoc()) {
            $productId = $rowProd['product_id'];
            $quantityOrdered = $rowProd['quantity'];

            if ($status === 'processing') {
                // Decrement stock but ensure stock does not go below zero
                $updateStockQuery = "UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?";
            } else if ($status === 'cancelled') {
                // Increment stock
                $updateStockQuery = "UPDATE products SET stock = stock + ? WHERE id = ?";
            }

            $stmtUpdateStock = $conn->prepare($updateStockQuery);
            $stmtUpdateStock->bind_param("ii", $quantityOrdered, $productId);
            if (!$stmtUpdateStock->execute()) {
                $conn->rollback();
                error_log("Failed to update stock for product ID $productId");
                echo json_encode(['success' => false, 'message' => 'Failed to update product stock']);
                exit;
            }
            $stmtUpdateStock->close();
        }
        $stmtProd->close();
    }

    $conn->commit();

    echo json_encode(['success' => true, 'message' => 'Order status updated successfully']);
} catch (Exception $e) {
    $conn->rollback();
    error_log("Error updating order status: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to update order status']);
}
?>
