<?php
require_once 'session_config.php';
require_once 'config.php'; // Database connection

// Configure and start session
configure_session();
set_local_cors_headers();
header('Content-Type: application/json');

// Check if the user is logged in by validating the session
$user = check_authentication();
$seller_id = $user['id'];

// Get JSON input
$inputData = json_decode(file_get_contents("php://input"), true);

// Check if required fields are provided
if (empty($inputData['product_id']) || empty($inputData['quantity'])) {
    echo json_encode(['success' => false, 'message' => 'Product ID and quantity are required.']);
    exit;
}

// Prepare the SQL query to add to cart
$stmt = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Failed to prepare SQL statement.']);
    exit;
}

// Bind parameters and execute the statement
$stmt->bind_param("iii", $seller_id, $inputData['product_id'], $inputData['quantity']);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Product added to cart successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add product to cart.']);
}

// Close the statement
$stmt->close();
?>