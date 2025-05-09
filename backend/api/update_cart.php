<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/update_cart_error.log');

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
        echo json_encode(['success' => false, 'message' => 'Unauthorized: No active session', 'auth_required' => true]);
        exit;
    }
    return ['id' => $_SESSION['userId']];
}

try {
    $user = check_authentication();
    $user_id = $user['id'];

    $inputData = json_decode(file_get_contents("php://input"), true);

    if (empty($inputData['product_id']) || !isset($inputData['quantity'])) {
        echo json_encode(['success' => false, 'message' => 'Product ID and quantity are required for updating cart.']);
        exit;
    }
    $product_id = $inputData['product_id'];
    $quantity = $inputData['quantity'];

    // Check MOQ from products table
    $moq_stmt = $conn->prepare("SELECT minOrderQuantity FROM products WHERE id = ?");
    if (!$moq_stmt) {
        echo json_encode(['success' => false, 'message' => 'Failed to prepare MOQ query.']);
        exit;
    }
    $moq_stmt->bind_param("i", $product_id);
    $moq_stmt->execute();
    $moq_result = $moq_stmt->get_result();
    if ($moq_result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Product not found.']);
        exit;
    }
    $moq_row = $moq_result->fetch_assoc();
    $moq = (int)$moq_row['minOrderQuantity'];
    $moq_stmt->close();

    if ($quantity < $moq) {
        echo json_encode(['success' => false, 'message' => "Quantity must be at least the minimum order quantity ($moq)."]);
        exit;
    }

    $update_stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE buyer_id = ? AND product_id = ?");
    if (!$update_stmt) {
        echo json_encode(['success' => false, 'message' => 'Failed to prepare update cart query.']);
        exit;
    }
    $update_stmt->bind_param("iii", $quantity, $user_id, $product_id);
    if ($update_stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Cart updated successfully.']);
    } else {
        error_log("Update Cart Error: " . $update_stmt->error);
        echo json_encode(['success' => false, 'message' => 'Failed to update cart.']);
    }
    $update_stmt->close();

} catch (Exception $e) {
    error_log("Update Cart API error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Internal server error.']);
}
?>
