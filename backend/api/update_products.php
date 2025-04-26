<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'cors.php';
require_once 'config.php'; // Database connection

session_start();
header('Content-Type: application/json');

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

$inputData = json_decode(file_get_contents("php://input"), true);
if (empty($inputData['id']) || empty($inputData['name']) || empty($inputData['description']) || empty($inputData['price']) || empty($inputData['stock']) || empty($inputData['image_url']) || !isset($inputData['categories'][0])) {
    echo json_encode(['success' => false, 'message' => 'All fields are required including category and product ID.']);
    exit;
}

$user = check_authentication();
if (!$user) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Please login.']);
    exit;
}

$id = intval($inputData['id']);
$name = $inputData['name'];
$description = $inputData['description'];
$price = $inputData['price'];
$stock = $inputData['stock'];
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

$stmt = $conn->prepare("UPDATE products SET name = ?, description = ?, price = ?, stock = ?, minOrderQuantity = ?, image_url = ?, category = ?, updated_at = NOW() WHERE id = ?");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Failed to prepare update statement.']);
    exit;
}

$stmt->bind_param("ssdiiisi", $name, $description, $price, $stock, $minOrderQuantity, $image_url, $category_name, $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Product updated successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update product.']);
}
$stmt->close();
?>
