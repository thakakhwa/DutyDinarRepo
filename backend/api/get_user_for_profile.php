<?php
// Force error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS Configuration - Adjust as needed for your frontend
header('Access-Control-Allow-Origin: *'); // Change to your specific origin in production
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database connection 
require_once("../controller/connection.php");

// Function to send consistent API responses
function print_response($success, $message, $data = null) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    exit;
}

try {
    // Check database connection
    if (!$conn || $conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    // Get user ID from request parameter
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    
    if ($user_id <= 0) {
        print_response(false, "Invalid or missing user ID");
        exit;
    }

    // Get user data with prepared statement
    $stmt = $conn->prepare("SELECT id, name, email, userType, companyName FROM users WHERE id = ?");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("i", $user_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        print_response(false, "User not found");
    } else {
        $user = $result->fetch_assoc();
        print_response(true, "User data retrieved successfully", $user);
    }

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    print_response(false, "Server error: " . $e->getMessage());
}
?>