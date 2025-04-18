<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('error_log', __DIR__ . '/php_error.log');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../connection.php'; // Using connection.php like your working examples

try {
    // Check if user ID is provided
    if (!isset($_GET['userId'])) {
        print_response(false, "User ID is required.");
        exit;
    }

    $userId = $_GET['userId'];
    
    // Validate user ID
    if (!is_numeric($userId)) {
        print_response(false, "Invalid user ID format.");
        exit;
    }

    // Prepare and execute query
    $stmt = $conn->prepare("SELECT id, name, email, userType, companyName, created_at, updated_at FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        print_response(false, "User not found.");
        exit;
    }

    $user = $result->fetch_assoc();
    
    // Prepare response data
    $responseData = [
        "id" => $user['id'],
        "name" => $user['name'],
        "email" => $user['email'],
        "userType" => $user['userType'],
        "companyName" => $user['companyName'],
        "created_at" => $user['created_at'],
        "updated_at" => $user['updated_at']
    ];

    print_response(true, "Profile loaded successfully", $responseData);

} catch (Exception $e) {
    error_log("Profile error: " . $e->getMessage());
    print_response(false, "Error: " . $e->getMessage());
}

function print_response($success, $message, $data = null) {
    $response = [
        "success" => $success,
        "message" => $message
    ];
    
    if ($data !== null) {
        $response["data"] = $data;
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}
?>