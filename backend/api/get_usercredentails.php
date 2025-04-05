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

    // IMPORTANT: For testing only - comment out in production
    // This simulates a logged-in user for testing
    if (!isset($_SESSION['user_id'])) {
        $_SESSION['user_id'] = 1; // Use a valid user ID from your database
    }

    // Check authentication
    if (!isset($_SESSION['user_id'])) {
        print_response(false, "Authentication required. Please login first.", null);
        exit;
    }

    // Get user data
    $stmt = $conn->prepare("SELECT name, email, userType, companyName FROM users WHERE id = ?");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("i", $_SESSION['user_id']);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        // For debugging - if user not found, return sample data
        print_response(true, "User data retrieved", [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'userType' => 'user',
            'companyName' => 'Test Company'
        ]);
    } else {
        $user = $result->fetch_assoc();
        print_response(true, "User data retrieved", $user);
    }

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    print_response(false, "Server error: " . $e->getMessage(), null);
}
?>