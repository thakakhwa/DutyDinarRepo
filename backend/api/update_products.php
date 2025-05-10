<?php
// Register a shutdown function to catch fatal errors
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Fatal server error: ' . $error['message'] . ' in ' . $error['file'] . ' on line ' . $error['line']
        ]);
    }
});

// Ensure no HTML error output is sent
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set proper headers
header('Content-Type: application/json');
require_once 'cors.php';
require_once 'config.php'; // Database connection
require_once '../controller/api_response.php'; // Include the file with print_response function

session_start();

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

function save_base64_image($base64_image, $upload_dir) {
    try {
        // Check if it's already a path
        if (strpos($base64_image, 'uploads/') !== false || strpos($base64_image, '/uploads/') !== false) {
            // If it contains /uploads/ with a leading slash, normalize it
            if (strpos($base64_image, '/uploads/') !== false) {
                return [true, str_replace('/uploads/', 'uploads/', $base64_image)];
            }
            return [true, $base64_image];
        }
        
        // Extract the image type and base64 data
        if (preg_match('/^data:image\/(\w+);base64,/', $base64_image, $type)) {
            // Log the length of the base64 string
            $base64_length = strlen($base64_image);
            error_log("Processing base64 image, length: " . $base64_length);
            
            $image_data = substr($base64_image, strpos($base64_image, ',') + 1);
            $image_type = strtolower($type[1]); // jpg, png, gif, etc.

            if (!in_array($image_type, ['jpg', 'jpeg', 'png', 'gif'])) {
                error_log("Unsupported image type: " . $image_type);
                return [false, 'Unsupported image type'];
            }

            $image_data = base64_decode($image_data);
            if ($image_data === false) {
                error_log("Base64 decode failed");
                return [false, 'Base64 decode failed'];
            }
            
            // Generate unique filename
            $file_name = uniqid('product_', true) . '.' . $image_type;
            $file_path = $upload_dir . DIRECTORY_SEPARATOR . $file_name;

            // Save the image file
            if (file_put_contents($file_path, $image_data) === false) {
                error_log("Failed to save image file at path: " . $file_path);
                return [false, 'Failed to save image file'];
            }
            
            $result_path = 'uploads/' . $file_name;
            error_log("Image saved successfully as: " . $result_path);
            return [true, $result_path];
        } else {
            error_log("Invalid image format: " . substr($base64_image, 0, 50) . "...");
            return [false, 'Invalid image format'];
        }
    } catch (Exception $e) {
        error_log("Exception in save_base64_image: " . $e->getMessage());
        return [false, 'Error processing image: ' . $e->getMessage()];
    }
}

try {
    // Debug log for request
    error_log("Received update_products.php request. Method: " . $_SERVER['REQUEST_METHOD']);
    
    // Get input data
    $input = file_get_contents("php://input");
    error_log("Raw input length: " . strlen($input));
    if (strlen($input) > 100) {
        error_log("Raw input (truncated): " . substr($input, 0, 100) . "...");
    } else {
        error_log("Raw input: " . $input);
    }
    
    $inputData = json_decode($input, true);
    if (!$inputData) {
        error_log("Failed to parse JSON input. JSON error: " . json_last_error_msg());
        print_response(false, 'Invalid JSON input: ' . json_last_error_msg());
    }

    // Validate required fields
    if (empty($inputData['id'])) {
        print_response(false, 'Product ID is required');
    }
    
    if (empty($inputData['name'])) {
        print_response(false, 'Product name is required');
    }
    
    if (empty($inputData['description'])) {
        print_response(false, 'Product description is required');
    }
    
    if (!isset($inputData['price'])) {
        print_response(false, 'Product price is required');
    }
    
    if (!isset($inputData['stock'])) {
        print_response(false, 'Product stock is required');
    }
    
    if (!isset($inputData['categories']) || !is_array($inputData['categories']) || count($inputData['categories']) === 0) {
        print_response(false, 'At least one category is required');
    }

    // Check authentication
    $user = check_authentication();
    if (!$user) {
        error_log("Authentication failed");
        print_response(false, 'Unauthorized: Please login.');
    }

    // Extract data
    $id = intval($inputData['id']);
    $name = $inputData['name'];
    $description = $inputData['description'];
    $price = floatval($inputData['price']);
    $stock = intval($inputData['stock']);
    $minOrderQuantity = isset($inputData['minOrderQuantity']) ? intval($inputData['minOrderQuantity']) : 1;
    $category_id = intval($inputData['categories'][0]);

    // First check if the product exists and get the existing image URL
    $check_stmt = $conn->prepare("SELECT image_url FROM products WHERE id = ?");
    $check_stmt->bind_param("i", $id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    $existing_product = $check_result->fetch_assoc();
    $check_stmt->close();
    
    if (!$existing_product) {
        error_log("Product not found: " . $id);
        print_response(false, 'Product not found');
    }
    
    // ALWAYS use the existing image URL from the database
    $image_url = $existing_product['image_url'];
    error_log("Using existing image URL from database: " . $image_url);

    // Get category name from category ID
    $category_name = '';
    $stmtCat = $conn->prepare("SELECT name FROM categories WHERE id = ?");
    if (!$stmtCat) {
        error_log("Failed to prepare category query: " . $conn->error);
        print_response(false, 'Failed to prepare category query: ' . $conn->error);
    }
    $stmtCat->bind_param("i", $category_id);
    $stmtCat->execute();
    $stmtCat->bind_result($category_name);
    $stmtCat->fetch();
    $stmtCat->close();

    if (empty($category_name)) {
        error_log("Invalid category selected: " . $category_id);
        print_response(false, 'Invalid category selected.');
    }

    // Begin transaction
    $conn->begin_transaction();

    try {
        // Debug log the values being used for update
        error_log("Updating product with ID: " . $id);
        error_log("Image URL to be saved: " . $image_url);
        
        $stmt = $conn->prepare("UPDATE products SET name = ?, description = ?, price = ?, stock = ?, minOrderQuantity = ?, category = ?, updated_at = NOW() WHERE id = ?");
        if (!$stmt) {
            error_log("Failed to prepare update statement: " . $conn->error);
            throw new Exception("Failed to prepare update statement: " . $conn->error);
        }

        $stmt->bind_param("ssdiisi", $name, $description, $price, $stock, $minOrderQuantity, $category_name, $id);

        if (!$stmt->execute()) {
            error_log("Failed to execute update statement: " . $stmt->error);
            throw new Exception("Failed to execute update statement: " . $stmt->error);
        }

        $affected_rows = $stmt->affected_rows;
        $stmt->close();
        
        if ($affected_rows === 0) {
            $conn->rollback();
            error_log("No rows affected. Product ID may not exist: " . $id);
            print_response(false, 'No product updated. The product may not exist or no changes were made.');
        } else {
            // Verify the update by fetching the product again
            $verify_stmt = $conn->prepare("SELECT image_url FROM products WHERE id = ?");
            $verify_stmt->bind_param("i", $id);
            $verify_stmt->execute();
            $verify_result = $verify_stmt->get_result();
            $updated_product = $verify_result->fetch_assoc();
            $verify_stmt->close();
            
            error_log("After update, image_url in database: " . ($updated_product['image_url'] ?? 'null'));
            
            $conn->commit();
            error_log("Product updated successfully. ID: " . $id);
            print_response(true, 'Product updated successfully.');
        }
    } catch (Exception $e) {
        $conn->rollback();
        error_log("Error updating product: " . $e->getMessage());
        print_response(false, 'Failed to update product: ' . $e->getMessage());
    }
} catch (Exception $e) {
    error_log("Uncaught exception: " . $e->getMessage());
    print_response(false, 'Server error: ' . $e->getMessage());
}
?>
