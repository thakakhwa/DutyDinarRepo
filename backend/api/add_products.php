<?php
<<<<<<< HEAD
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

=======
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'cors.php';
require_once 'config.php'; // Database connection

session_start();
header('Content-Type: application/json');

error_log("Session data: " . print_r($_SESSION, true));
error_log("Raw input: " . file_get_contents('php://input'));

function check_authentication() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (isset($_SESSION['userId']) && isset($_SESSION['userType'])) {
        return [
            'id' => $_SESSION['userId'],
            'userType' => $_SESSION['userType']
        ];
    }
    return null;
}

// Check if required fields are provided
$inputData = json_decode(file_get_contents("php://input"), true);
if (empty($inputData['name']) || empty($inputData['description']) || empty($inputData['price']) || empty($inputData['stock']) || empty($inputData['image_url']) || !isset($inputData['categories'][0])) {
    echo json_encode(['success' => false, 'message' => 'All fields are required including category.']);
    exit;
}

// Check if the user is logged in by validating the session
$user = check_authentication();
if (!$user) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Please login.']);
    exit;
}
$seller_id = $user['id'];

>>>>>>> fixedbranchfsfs
// Prepare the product data from the input
$name = $inputData['name'];
$description = $inputData['description'];
$price = $inputData['price'];
$stock = $inputData['stock'];
<<<<<<< HEAD
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
=======
$minOrderQuantity = isset($inputData['minOrderQuantity']) ? intval($inputData['minOrderQuantity']) : 1;
$image_url = $inputData['image_url'];
$category_id = intval($inputData['categories'][0]);

// Get category name from category ID
$category_name = '';
$stmtCat = $conn->prepare("SELECT name FROM categories WHERE id = ?");
if (!$stmtCat) {
    echo json_encode(['success' => false, 'message' => 'Failed to prepare category query.']);
    exit;
}
$stmtCat->bind_param("i", $category_id);
$stmtCat->execute();
$stmtCat->bind_result($category_name);
$stmtCat->fetch();
$stmtCat->close();

if (empty($category_name)) {
    echo json_encode(['success' => false, 'message' => 'Invalid category selected.']);
    exit;
}

// Begin transaction
$conn->begin_transaction();

try {
    // Insert product with category name
    $stmt = $conn->prepare("INSERT INTO products (seller_id, name, description, price, stock, minOrderQuantity, image_url, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
    if (!$stmt) {
        throw new Exception("Failed to prepare SQL statement: " . $conn->error);
    }

    $bind = $stmt->bind_param("issdisis", $seller_id, $name, $description, $price, $stock, $minOrderQuantity, $image_url, $category_name);
    if (!$bind) {
        throw new Exception("Failed to bind parameters: " . $stmt->error);
    }

    if (!$stmt->execute()) {
        throw new Exception("Failed to execute statement: " . $stmt->error);
    }

    $stmt->close();

    // Commit transaction
    $conn->commit();

    echo json_encode(['success' => true, 'message' => 'Product added successfully.']);
} catch (Exception $e) {
    $conn->rollback();
    error_log("Error adding product: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to add product: ' . $e->getMessage()]);
}
?>
>>>>>>> fixedbranchfsfs
