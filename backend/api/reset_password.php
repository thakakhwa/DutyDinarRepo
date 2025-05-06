<?php
// Set error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// This is a standalone CORS handler that doesn't load any dependencies 
// and just handles the preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    require_once 'cors_handler.php';
    exit;
}

// For normal requests, we can use the full flow
require_once 'config.php';
require_once 'cors.php';

// Set CORS headers explicitly again for the main request
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);
error_log("Reset Password API: Received input: " . json_encode($input));

if (empty($input['user_id']) || empty($input['reset_token']) || 
    empty($input['new_password']) || empty($input['confirm_password'])) {
    error_log("Reset Password API: Missing required fields");
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

$userId = $input['user_id'];
$resetToken = $input['reset_token'];
$newPassword = $input['new_password'];
$confirmPassword = $input['confirm_password'];

error_log("Reset Password API: Processing request for user ID: $userId with token: $resetToken");

try {
    // Validate passwords match
    if ($newPassword !== $confirmPassword) {
        error_log("Reset Password API: Passwords do not match");
        echo json_encode(['success' => false, 'message' => 'Passwords do not match']);
        exit;
    }
    
    // Validate password strength - at least 8 characters
    if (strlen($newPassword) < 8) {
        error_log("Reset Password API: Password too short");
        echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters long']);
        exit;
    }
    
    // First, check if any reset token exists for this user
    $checkStmt = $conn->prepare("SELECT * FROM password_reset_codes WHERE user_id = ?");
    if (!$checkStmt) {
        error_log("Reset Password API: Prepare failed for check: " . $conn->error);
        throw new Exception("Database error: " . $conn->error);
    }
    $checkStmt->bind_param("i", $userId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        error_log("Reset Password API: No reset codes found for user ID: " . $userId);
        echo json_encode([
            'success' => false, 
            'message' => 'No reset code found for this user. Please request a new code.'
        ]);
        exit;
    } else {
        // Log all tokens for debugging
        while ($row = $checkResult->fetch_assoc()) {
            error_log("Reset Password API: Found token in DB: " . ($row['reset_token'] ? $row['reset_token'] : 'NULL') . 
                      " for user ID: " . $row['user_id'] . 
                      ", expires: " . $row['expires_at'] . 
                      ", code: " . $row['reset_code']);
        }
    }
    $checkStmt->close();
    
    // Verify the reset token is valid, without expiry check first
    $stmt = $conn->prepare("SELECT * FROM password_reset_codes WHERE user_id = ? AND reset_token = ?");
    if (!$stmt) {
        error_log("Reset Password API: Prepare failed: " . $conn->error);
        throw new Exception("Database error: " . $conn->error);
    }
    $stmt->bind_param("is", $userId, $resetToken);
    if (!$stmt->execute()) {
        error_log("Reset Password API: Execute failed: " . $stmt->error);
        throw new Exception("Database error: " . $stmt->error);
    }
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        error_log("Reset Password API: Invalid token for user ID: " . $userId);
        echo json_encode([
            'success' => false, 
            'message' => 'Invalid reset token. Please try again with a new reset code.'
        ]);
        exit;
    }
    
    $resetData = $result->fetch_assoc();
    
    // Now check if the token is expired
    $currentTime = date('Y-m-d H:i:s');
    $expiresAt = $resetData['expires_at'];
    $isExpired = strtotime($expiresAt) <= time();
    
    error_log("Reset Password API: Token expires at: " . $expiresAt . ", Current time: " . $currentTime);
    error_log("Reset Password API: Token is " . ($isExpired ? "expired" : "valid"));
    
    if ($isExpired) {
        error_log("Reset Password API: Expired token for user ID: " . $userId);
        echo json_encode([
            'success' => false, 
            'message' => 'Reset token has expired. Please request a new code.'
        ]);
        $stmt->close();
        exit;
    }
    
    $stmt->close();
    
    // Update the user's password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    if (!$updateStmt) {
        error_log("Reset Password API: Prepare failed for password update: " . $conn->error);
        throw new Exception("Database error: " . $conn->error);
    }
    $updateStmt->bind_param("si", $hashedPassword, $userId);
    if (!$updateStmt->execute()) {
        error_log("Reset Password API: Execute failed for password update: " . $updateStmt->error);
        throw new Exception("Database error: " . $updateStmt->error);
    }
    $updateStmt->close();
    
    // Delete the reset code entry
    $deleteStmt = $conn->prepare("DELETE FROM password_reset_codes WHERE id = ?");
    if ($deleteStmt) {
        $deleteStmt->bind_param("i", $resetData['id']);
        $deleteStmt->execute();
        $deleteStmt->close();
    }
    
    // Return success
    error_log("Reset Password API: Successfully reset password for user ID: " . $userId);
    echo json_encode([
        'success' => true, 
        'message' => 'Your password has been successfully reset. Please login with your new password.'
    ]);
    
} catch (Exception $e) {
    error_log("Reset Password API: Exception caught: " . $e->getMessage());
    error_log("Reset Password API: Exception trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
}
?> 