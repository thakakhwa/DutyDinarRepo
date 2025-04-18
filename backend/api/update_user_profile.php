<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('error_log', __DIR__ . '/php_error.log');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'connection.php';

try {
    // Get JSON input
    $input = json_decode(file_get_contents("php://input"), true);
    
    // Check required fields
    if (!isset($input['userId']) || !isset($input['name'])) {
        print_response(false, "User ID and name are required.");
        exit;
    }

    $userId = $input['userId'];
    $name = $input['name'];
    $companyName = $input['companyName'] ?? null;
    
    // Validate user ID
    if (!is_numeric($userId)) {
        print_response(false, "Invalid user ID format.");
        exit;
    }

    // Check if user exists and get user type
    $checkStmt = $conn->prepare("SELECT id, userType FROM users WHERE id = ?");
    $checkStmt->bind_param("i", $userId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        print_response(false, "User not found.");
        exit;
    }
    
    $user = $checkResult->fetch_assoc();
    
    // Prepare update based on user type
    if ($user['userType'] === 'seller') {
        $updateStmt = $conn->prepare("UPDATE users SET name = ?, companyName = ? WHERE id = ?");
        $updateStmt->bind_param("ssi", $name, $companyName, $userId);
    } else {
        $updateStmt = $conn->prepare("UPDATE users SET name = ? WHERE id = ?");
        $updateStmt->bind_param("si", $name, $userId);
    }
    
    if (!$updateStmt->execute()) {
        throw new Exception("Failed to update profile: " . $conn->error);
    }
    
    // Get updated profile
    $getStmt = $conn->prepare("SELECT id, name, email, userType, companyName, created_at, updated_at FROM users WHERE id = ?");
    $getStmt->bind_param("i", $userId);
    $getStmt->execute();
    $result = $getStmt->get_result();
    $updatedUser = $result->fetch_assoc();
    
    $responseData = [
        "id" => $updatedUser['id'],
        "name" => $updatedUser['name'],
        "email" => $updatedUser['email'],
        "userType" => $updatedUser['userType'],
        "companyName" => $updatedUser['companyName'],
        "created_at" => $updatedUser['created_at'],
        "updated_at" => $updatedUser['updated_at']
    ];

    print_response(true, "Profile updated successfully", $responseData);
    
} catch (Exception $e) {
    error_log("Profile update error: " . $e->getMessage());
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