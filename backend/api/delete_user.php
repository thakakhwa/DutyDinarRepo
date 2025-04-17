<?php
// Force error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Load required files
require_once("../controller/api_response.php");
require_once("../controller/connection.php");
require_once("config.php");

// CORS Configuration
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configure and start session
configure_session();

try {
    // Check database connection
    if (!$conn || $conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    // Check authentication
    if (!isset($_SESSION['user_id'])) {
        print_response(false, "Authentication required. Please login first.", null);
        exit;
    }

    // Handle DELETE request to delete user
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $user_id = $_SESSION['user_id'];
        
        // Start transaction to ensure all related data is deleted properly
        $conn->begin_transaction();
        
        try {
            // Delete the user (foreign key constraints should handle related data)
            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $conn->error);
            }
            
            $stmt->bind_param("i", $user_id);
            
            if (!$stmt->execute()) {
                throw new Exception("Execute failed: " . $stmt->error);
            }
            
            // If successful, commit the transaction
            $conn->commit();
            
            // Clear session data
            session_unset();
            session_destroy();
            
            print_response(true, "User account deleted successfully", null);
        } catch (Exception $e) {
            // If an error occurs, roll back the transaction
            $conn->rollback();
            throw $e;
        }
    } else {
        // If request method is not DELETE
        print_response(false, "Invalid request method", null);
    }

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    print_response(false, "Server error: " . $e->getMessage(), null);
}
?>