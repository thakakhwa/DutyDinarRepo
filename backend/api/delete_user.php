<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'cors.php';
require_once 'config.php'; // Database connection

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['userId'])) {
    print_response(false, 'User not logged in');
}

$user_id = $_SESSION['userId'];

// Use the $conn variable from connection.php
try {
    // Prepare and execute delete query
    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        // Destroy session after deletion
        session_destroy();
        print_response(true, 'User deleted successfully');
    } else {
        print_response(false, 'User not found or already deleted');
    }

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    print_response(false, 'Error deleting user: ' . $e->getMessage());
}
?>
