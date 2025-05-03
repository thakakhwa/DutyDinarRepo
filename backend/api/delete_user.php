<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'cors.php';
require_once 'config.php'; // Database connection

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['userId'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
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
        echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found or already deleted']);
    }

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error deleting user: ' . $e->getMessage()]);
}
?>
