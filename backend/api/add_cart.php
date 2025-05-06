<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/add_cart_error.log');

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
        print_response(false, 'Unauthorized: No active session');
    }
    return ['id' => $_SESSION['userId']];
}

try {
    $user = check_authentication();
    $user_id = $user['id'];

    $inputData = json_decode(file_get_contents("php://input"), true);

    if (empty($inputData['product_id']) || !isset($inputData['quantity'])) {
        print_response(false, 'Product ID and quantity are required for adding to cart.');
    }
    $product_id = $inputData['product_id'];
    $quantity = $inputData['quantity'];

    // Check MOQ from products table
    $moq_stmt = $conn->prepare("SELECT minOrderQuantity FROM products WHERE id = ?");
    if (!$moq_stmt) {
        print_response(false, 'Failed to prepare MOQ query.');
    }
    $moq_stmt->bind_param("i", $product_id);
    $moq_stmt->execute();
    $moq_result = $moq_stmt->get_result();
    if ($moq_result->num_rows === 0) {
        print_response(false, 'Product not found.');
    }
    $moq_row = $moq_result->fetch_assoc();
    $moq = (int)$moq_row['minOrderQuantity'];
    $moq_stmt->close();

    if ($quantity < $moq) {
        // Automatically set quantity to MOQ if less
        $quantity = $moq;
    }

    // Check if item already in cart
    $check_stmt = $conn->prepare("SELECT quantity FROM cart WHERE buyer_id = ? AND product_id = ?");
    if (!$check_stmt) {
        print_response(false, 'Failed to prepare check cart query.');
    }
    $check_stmt->bind_param("ii", $user_id, $product_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();

    if ($check_result->num_rows > 0) {
        // Update quantity
        $existing = $check_result->fetch_assoc();
        $new_quantity = $existing['quantity'] + $quantity;
    if ($new_quantity < $moq) {
        print_response(false, "Total quantity must be at least the minimum order quantity ($moq).");
    }
        $update_stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE buyer_id = ? AND product_id = ?");
        if (!$update_stmt) {
            print_response(false, 'Failed to prepare update cart query.');
        }
        $update_stmt->bind_param("iii", $new_quantity, $user_id, $product_id);
        if ($update_stmt->execute()) {
            print_response(true, 'Cart updated successfully.');
        } else {
            error_log("Add Cart Update Error: " . $update_stmt->error);
            print_response(false, 'Failed to update cart.');
        }
        $update_stmt->close();
    } else {
        // Insert new item
        $insert_stmt = $conn->prepare("INSERT INTO cart (buyer_id, product_id, quantity) VALUES (?, ?, ?)");
        if (!$insert_stmt) {
            print_response(false, 'Failed to prepare insert cart query.');
        }
        $insert_stmt->bind_param("iii", $user_id, $product_id, $quantity);
        if ($insert_stmt->execute()) {
            print_response(true, 'Product added to cart successfully.');
        } else {
            error_log("Add Cart Insert Error: " . $insert_stmt->error);
            print_response(false, 'Failed to add product to cart.');
        }
        $insert_stmt->close();
    }
    $check_stmt->close();

} catch (Exception $e) {
    error_log("Add Cart API error: " . $e->getMessage());
    print_response(false, 'Internal server error.');
}
?>
