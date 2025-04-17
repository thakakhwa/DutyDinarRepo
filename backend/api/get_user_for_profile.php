<?php
// Force error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Load required files
require_once("../controller/api_response.php");
require_once("../controller/connection.php");

// CORS Configuration
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit(0);
}

// Start session
session_start();

try {
    // Check database connection
    if (!$conn || $conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    // Get user ID from request parameter instead of session
    // This lets us bypass the problematic session code
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    
    if ($user_id <= 0) {
        // If no user ID provided, check if there's one in the session
        $user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0;
        
        // If we still don't have a valid user ID
        if ($user_id <= 0) {
            print_response(false, "No user ID provided", null);
            exit;
        }
    }

    // Get user data
    $stmt = $conn->prepare("SELECT name, email, userType, companyName FROM users WHERE id = ?");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("i", $user_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        print_response(false, "User not found", null);
    } else {
        $user = $result->fetch_assoc();
        print_response(true, "User data retrieved", $user);
    }

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    print_response(false, "Server error: " . $e->getMessage(), null);
}
?>