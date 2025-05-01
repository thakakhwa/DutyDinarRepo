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
    $myProducts = isset($_GET['myProducts']) ? $_GET['myProducts'] === 'true' : false;
    $sellerId = isset($_GET['seller_id']) ? intval($_GET['seller_id']) : null;

    error_log("get_products.php called with myProducts: " . ($myProducts ? "true" : "false") . ", seller_id: " . $sellerId);

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
    } elseif ($myProducts && $sellerId) {
        // Fetch products by seller_id
        $sql = "SELECT p.id, p.name, p.description, p.price, p.stock, p.category, p.image_url, p.minOrderQuantity, u.companyName 
                FROM products p 
                LEFT JOIN users u ON p.seller_id = u.id 
                WHERE p.seller_id = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            error_log("Failed to prepare SQL statement for seller products.");
            throw new Exception("Failed to prepare SQL statement.");
        }
        $stmt->bind_param("i", $sellerId);
    } else {
        // Check if search query is provided
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';

        if ($search !== '') {
            // Fetch products matching search query in name or description
            $searchParam = '%' . $search . '%';
            $sql = "SELECT p.id, p.name, p.description, p.price, p.stock, p.category, p.image_url, p.minOrderQuantity, u.companyName 
                    FROM products p 
                    LEFT JOIN users u ON p.seller_id = u.id 
                    WHERE p.name LIKE ? OR p.description LIKE ?";
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                error_log("Failed to prepare SQL statement for search products.");
                throw new Exception("Failed to prepare SQL statement.");
            }
            $stmt->bind_param("ss", $searchParam, $searchParam);
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
    }

    error_log("Executing SQL: " . $sql);

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
            error_log("Number of products fetched: " . count($products));
            print_response(true, "Products fetched successfully.", ["products" => $products]);
        }

} catch (Exception $e) {
    error_log("Error in get_products.php: " . $e->getMessage());
    print_response(false, "Error: " . $e->getMessage());
}
?>
