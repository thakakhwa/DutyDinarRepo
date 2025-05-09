<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/cart_errors.log');

// CORS headers
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include database connection
require_once '../controller/connection.php';

// Start session
session_start();

// Simple function to output JSON response
function output_json($success, $message, $auth_required = false, $data = null) {
    $response = [
        'success' => $success,
        'message' => $message,
        'auth_required' => $auth_required
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    exit;
}

// Check if user is logged in
if (!isset($_SESSION['userId']) || empty($_SESSION['userId'])) {
    http_response_code(401);
    output_json(false, 'You need to be logged in to add items to cart', true);
}

// Get user ID
$user_id = (int)$_SESSION['userId'];

try {
    // Parse JSON input
    $json_data = file_get_contents('php://input');
    $input_data = json_decode($json_data, true);
    
    // Validate input
    if (!isset($input_data['product_id']) || !isset($input_data['quantity'])) {
        output_json(false, 'Product ID and quantity are required');
    }
    
    // Sanitize and validate input
    $product_id = (int)$input_data['product_id'];
    $quantity = (int)$input_data['quantity'];
    
    if ($product_id <= 0) {
        output_json(false, 'Invalid product ID');
    }
    
    if ($quantity <= 0) {
        output_json(false, 'Quantity must be greater than zero');
    }
    
    // Check if product exists and get minimum order quantity
    $product_query = "SELECT minOrderQuantity FROM products WHERE id = ?";
    $stmt = $conn->prepare($product_query);
    
    if (!$stmt) {
        output_json(false, 'Database error: ' . $conn->error);
    }
    
    $stmt->bind_param("i", $product_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        output_json(false, 'Product not found');
    }
    
    $product_data = $result->fetch_assoc();
    $min_order_quantity = (int)$product_data['minOrderQuantity'];
    $stmt->close();
    
    // Adjust quantity if it's less than minimum order quantity
    if ($min_order_quantity > 0 && $quantity < $min_order_quantity) {
        $quantity = $min_order_quantity;
    }
    
    // Check if product is already in cart
    $check_query = "SELECT quantity FROM cart WHERE buyer_id = ? AND product_id = ?";
    $stmt = $conn->prepare($check_query);
    
    if (!$stmt) {
        output_json(false, 'Database error: ' . $conn->error);
    }
    
    $stmt->bind_param("ii", $user_id, $product_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $stmt->close();
    
    // If product already in cart, update quantity
    if ($result->num_rows > 0) {
        $cart_item = $result->fetch_assoc();
        $new_quantity = $cart_item['quantity'] + $quantity;
        
        $update_query = "UPDATE cart SET quantity = ? WHERE buyer_id = ? AND product_id = ?";
        $stmt = $conn->prepare($update_query);
        
        if (!$stmt) {
            output_json(false, 'Database error: ' . $conn->error);
        }
        
        $stmt->bind_param("iii", $new_quantity, $user_id, $product_id);
        
        if ($stmt->execute()) {
            output_json(true, 'Cart updated successfully');
        } else {
            output_json(false, 'Failed to update cart: ' . $stmt->error);
        }
        
        $stmt->close();
    } else {
        // If product not in cart, add it
        $insert_query = "INSERT INTO cart (buyer_id, product_id, quantity) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($insert_query);
        
        if (!$stmt) {
            output_json(false, 'Database error: ' . $conn->error);
        }
        
        $stmt->bind_param("iii", $user_id, $product_id, $quantity);
        
        if ($stmt->execute()) {
            output_json(true, 'Product added to cart successfully');
        } else {
            output_json(false, 'Failed to add product to cart: ' . $stmt->error);
        }
        
        $stmt->close();
    }
    
} catch (Exception $e) {
    // Log the error
    error_log('Add to cart error: ' . $e->getMessage());
    output_json(false, 'An unexpected error occurred. Please try again later.');
}
?>
