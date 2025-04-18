<?php
require_once 'session_config.php';
require_once 'config.php'; // Database connection

// Configure and start session
configure_session();
set_local_cors_headers();
header('Content-Type: application/json');

// Check if required fields are provided
$inputData = json_decode(file_get_contents("php://input"), true);
if (empty($inputData['name']) || empty($inputData['description']) || empty($inputData['price']) || empty($inputData['stock']) || empty($inputData['image_url'])) {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

// Check if the user is logged in by validating the session
$user = check_authentication();
$seller_id = $user['id'];

// Prepare the product data from the input
$name = $inputData['name'];
$description = $inputData['description'];
$price = $inputData['price'];
$stock = $inputData['stock'];
$image_url = $inputData['image_url'];

// Prepare the SQL query to insert the product
$stmt = $conn->prepare("INSERT INTO products (seller_id, name, description, price, stock, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Failed to prepare SQL statement.']);
    exit;
}

// Bind parameters and execute the statement
$stmt->bind_param("issdis", $seller_id, $name, $description, $price, $stock, $image_url);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Product added successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add product.']);
}

// Close the statement
$stmt->close();
?>