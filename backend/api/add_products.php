<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");

require_once '../config/database.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

$response = ['success' => false, 'message' => ''];

try {
    // Session configuration
    session_set_cookie_params([
        'lifetime' => 86400,
        'path' => '/',
        'domain' => 'localhost',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();

    // Validate session
    if (!isset($_SESSION['user_id'])) {
        throw new Exception("User authentication required. Please login.");
    }
    $sellerId = $_SESSION['user_id'];

    // Get and validate input
    $data = json_decode(file_get_contents('php://input'), true);
    if ($data === null) {
        throw new Exception("Invalid JSON input: " . json_last_error_msg());
    }

    // Validate required fields
    $required = ['name', 'description', 'price', 'stock', 'minOrderQuantity', 'image_url'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
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

    // Handle categories
    if (!empty($data['categories'])) {
        // Validate categories
        $placeholders = implode(',', array_fill(0, count($data['categories']), '?'));
        $stmt = $pdo->prepare("SELECT id FROM categories WHERE id IN ($placeholders)");
        $stmt->execute($data['categories']);
        $validCategories = $stmt->fetchAll(PDO::FETCH_COLUMN);

        if (count($validCategories) !== count($data['categories'])) {
            throw new Exception("Invalid category IDs detected");
        }

        // Insert categories
        $stmt = $pdo->prepare("INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)");
        foreach ($validCategories as $categoryId) {
            $stmt->execute([$productId, $categoryId]);
        }
    }

    $pdo->commit();
    $response = [
        'success' => true,
        'message' => 'Product added successfully',
        'productId' => $productId
    ];

} catch (PDOException $e) {
    $pdo->rollBack();
    $response['message'] = "Database error: " . $e->getMessage();
    http_response_code(500);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    $response['message'] = $e->getMessage();
    http_response_code(400);
} finally {
    echo json_encode($response);
}