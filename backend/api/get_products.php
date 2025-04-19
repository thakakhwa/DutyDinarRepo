<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'cors.php';
header('Access-Control-Allow-Methods: GET, POST'); // Allow GET for single product

require_once 'config.php';

try {
    if (!$conn) {
        error_log("Database connection failed.");
        throw new Exception("Database connection failed.");
    }

    // Check if a product ID is provided in the request
    $productId = isset($_GET['id']) ? $_GET['id'] : null;

    if ($productId) {
        // Fetch a single product by ID with company name
        $sql = "SELECT p.id, p.name, p.description, p.price, p.stock, p.category, p.image_url, p.minOrderQuantity, u.companyName 
                FROM products p 
                LEFT JOIN users u ON p.seller_id = u.id 
                WHERE p.id = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            error_log("Failed to prepare SQL statement for single product.");
            throw new Exception("Failed to prepare SQL statement.");
        }
        $stmt->bind_param("i", $productId);
    } else {
        // Fetch all products with company name
        $sql = "SELECT p.id, p.name, p.description, p.price, p.stock, p.category, p.image_url, p.minOrderQuantity, u.companyName 
                FROM products p 
                LEFT JOIN users u ON p.seller_id = u.id";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            error_log("Failed to prepare SQL statement for all products.");
            throw new Exception("Failed to prepare SQL statement.");
        }
    }

    $stmt->execute();
    $result = $stmt->get_result();

    // Use print_response from included api_response.php
        if ($productId) {
            if ($result->num_rows === 0) {
                print_response(false, "Product not found.");
                exit;
            }
            $product = $result->fetch_assoc();
            print_response(true, "Product fetched successfully.", ["product" => $product]);
        } else {
            if ($result->num_rows === 0) {
                print_response(false, "No products found.");
                exit;
            }
            $products = [];
            while ($row = $result->fetch_assoc()) {
                $products[] = $row;
            }
            print_response(true, "Products fetched successfully.", ["products" => $products]);
        }

} catch (Exception $e) {
    error_log("Error in get_products.php: " . $e->getMessage());
    print_response(false, "Error: " . $e->getMessage());
}
?>
