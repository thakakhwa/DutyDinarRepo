<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

require_once './config.php';

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

$response = ['success' => false, 'message' => ''];

try {
    // Get and validate input
    $data = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON input");
    }

    // Validate required fields
    $required = ['name', 'description', 'price', 'stock', 'minOrderQuantity', 'image_url'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            throw new Exception("Missing required field: $field");
        }
    }

    // Validate numeric fields
    $numericFields = ['price', 'stock', 'minOrderQuantity'];
    foreach ($numericFields as $field) {
        if (!is_numeric($data[$field])) {
            throw new Exception("Invalid value for $field: must be numeric");
        }
    }

    // Start session and get seller ID
    session_start();
    if (!isset($_SESSION['user_id'])) {
        throw new Exception("User not authenticated");
    }
    $sellerId = $_SESSION['user_id'];

    // Start transaction
    $pdo->beginTransaction();

    // Insert product
    $stmt = $pdo->prepare("INSERT INTO products 
        (seller_id, name, description, price, stock, minOrderQuantity, image_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->execute([
        $sellerId,
        htmlspecialchars($data['name']),
        htmlspecialchars($data['description']),
        floatval($data['price']),
        intval($data['stock']),
        intval($data['minOrderQuantity']),
        filter_var($data['image_url'], FILTER_SANITIZE_URL)
    ]);
    
    $productId = $pdo->lastInsertId();

    // Insert categories if provided
    if (!empty($data['categories'])) {
        // Validate categories exist
        $placeholders = rtrim(str_repeat('?,', count($data['categories'])), ',');
        $stmt = $pdo->prepare("SELECT id FROM categories WHERE id IN ($placeholders)");
        $stmt->execute($data['categories']);
        $validCategories = $stmt->fetchAll(PDO::FETCH_COLUMN);

        if (count($validCategories) !== count($data['categories'])) {
            throw new Exception("One or more invalid category IDs");
        }

        // Insert valid categories
        $stmt = $pdo->prepare("INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)");
        foreach ($validCategories as $categoryId) {
            $stmt->execute([$productId, $categoryId]);
        }
    }

    $pdo->commit();
    $response['success'] = true;
    $response['message'] = 'Product added successfully';

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    $response['message'] = $e->getMessage();
    http_response_code(400);
} finally {
    echo json_encode($response);
}