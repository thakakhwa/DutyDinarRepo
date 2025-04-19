<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/delete_cart_error.log');

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php'; // Database connection

session_start();

function check_authentication() {
    if (!isset($_SESSION['userId'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized: No active session']);
        exit;
    }
    return ['id' => $_SESSION['userId']];
}

try {
    $user = check_authentication();
    $user_id = $user['id'];

    $inputData = json_decode(file_get_contents("php://input"), true);

    if (empty($inputData['product_id'])) {
        echo json_encode(['success' => false, 'message' => 'Product ID is required for removing from cart.']);
        exit;
    }
    $product_id = $inputData['product_id'];

    // Removed MOQ check to allow removal regardless of MOQ

    $delete_stmt = $conn->prepare("DELETE FROM cart WHERE buyer_id = ? AND product_id = ?");
    if (!$delete_stmt) {
        echo json_encode(['success' => false, 'message' => 'Failed to prepare delete cart query.']);
        exit;
    }
    $delete_stmt->bind_param("ii", $user_id, $product_id);
    if ($delete_stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Product removed from cart successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to remove product from cart.']);
    }
    $delete_stmt->close();

} catch (Exception $e) {
    error_log("Delete Cart API error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Internal server error.']);
}
?>
