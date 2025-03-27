<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php'; // Include database connection

try {
    // Check if the database connection exists
    if (!$conn) {
        throw new Exception("Database connection failed.");
    }

    // SQL query to fetch all products (no filters)
    $sql = "SELECT id, name, description, price, stock, category, image_url, minOrderQuantity FROM products";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Failed to prepare SQL statement.");
    }

    // Execute query
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if no products are found
    if ($result->num_rows === 0) {
        print_response(false, "No products found.");
    }

    // Fetch products from the result
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'description' => $row['description'],
            'price' => $row['price'],
            'stock' => $row['stock'],
            'category' => $row['category'],
            'image_url' => $row['image_url'],
            'minOrderQuantity' => $row['minOrderQuantity'] // Include minOrderQuantity
        ];
    }

    // Return the products in the response
    print_response(true, "Products fetched successfully.", ["products" => $products]);

} catch (Exception $e) {
    print_response(false, "Error: " . $e->getMessage());
}
?>
