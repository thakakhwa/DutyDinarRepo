<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once 'config.php'; // Include your existing database connection

session_start();

try {
    if (!$conn) {
        throw new Exception("Database connection failed.");
    }

    // Check authentication
    if (!isset($_SESSION['user_id'])) {
        print_response(false, "Authentication required", [], 401);
        exit;
    }

    $stmt = $conn->prepare("SELECT name AS username, email FROM users WHERE id = ?");
    if (!$stmt) {
        throw new Exception("Failed to prepare SQL statement: " . $conn->error);
    }

    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        print_response(false, "User not found", [], 404);
    }

    $user = $result->fetch_assoc();
    print_response(true, "User credentials fetched", ["user" => $user]);

} catch (Exception $e) {
    print_response(false, "Error: " . $e->getMessage(), [], 500);
}

// Assuming this exists in config.php or another included file
function print_response($success, $message, $data = [], $status_code = 200) {
    http_response_code($status_code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}
?>