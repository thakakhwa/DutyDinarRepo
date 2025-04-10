<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST'); // Allow GET for single product
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed.");
    }

    // Check if a product ID is provided in the request
    $productId = isset($_GET['id']) ? $_GET['id'] : null;

    if ($productId) {
        // Fetch a single product by ID
        $sql = "SELECT id, name, description, price, stock, category, image_url, minOrderQuantity FROM products WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Failed to prepare SQL statement.");
        }
        $stmt->bind_param("i", $productId);
    } else {
        // Fetch all products (original behavior)
        $sql = "SELECT id, name, description, price, stock, category, image_url, minOrderQuantity FROM products";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Failed to prepare SQL statement.");
        }
    }

    $stmt->execute();
    $result = $stmt->get_result();

    // Handle single product response
    if ($productId) {
        if ($result->num_rows === 0) {
            print_response(false, "Product not found.");
        }
        $product = $result->fetch_assoc();
        print_response(true, "Product fetched successfully.", ["product" => $product]);
    } 
    // Handle all products response
    else {
        if ($result->num_rows === 0) {
            print_response(false, "No products found.");
        }
        $products = [];
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        print_response(true, "Products fetched successfully.", ["products" => $products]);
    }

} catch (Exception $e) {
    print_response(false, "Error: " . $e->getMessage());
}
?>