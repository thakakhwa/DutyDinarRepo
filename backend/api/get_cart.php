
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once 'cors.php';
session_start();

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!isset($_SESSION['userId'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized: No active session']);
    exit;
}

require_once 'config.php';

$userId = $_SESSION['userId'];

// Debug log for userId
error_log("get_cart.php called for userId: " . $userId);

    try {
        // Fetch cart items for the user
        $stmt = $conn->prepare("
            SELECT 
                c.product_id,
                SUM(c.quantity) AS quantity,
                p.name AS product_name,
                p.price AS product_price,
                p.image_url AS product_image_url,
                p.minOrderQuantity AS min_order_quantity
            FROM cart c
            INNER JOIN products p ON c.product_id = p.id
            WHERE c.buyer_id = ?
            GROUP BY c.product_id, p.name, p.price, p.image_url, p.minOrderQuantity
        ");
        if (!$stmt) {
            throw new Exception('Database error: ' . $conn->error);
        }

        $stmt->bind_param("i", $userId);

        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        $result = $stmt->get_result();

        if (!$result) {
            throw new Exception('Get result failed: ' . $stmt->error);
        }

        $cartItems = [];
        while ($row = $result->fetch_assoc()) {
            $cartItems[] = $row;
        }

        $stmt->close();
        $conn->close();

        echo json_encode(['success' => true, 'data' => $cartItems]);
    } catch (Exception $e) {
        error_log("get_cart.php error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Internal server error']);
    }
?>
