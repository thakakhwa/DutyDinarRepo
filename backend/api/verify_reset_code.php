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
error_log("Verify Reset Code API: Received input: " . json_encode($input));

if (empty($input['email']) || empty($input['code'])) {
    error_log("Verify Reset Code API: Email or code is missing");
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and verification code are required']);
    exit;
}

$email = $input['email'];
$code = $input['code'];
error_log("Verify Reset Code API: Processing request for email: $email, code: $code");

try {
    // First check if there are any codes for this email
    $checkStmt = $conn->prepare("SELECT * FROM password_reset_codes WHERE email = ?");
    if (!$checkStmt) {
        error_log("Verify Reset Code API: Prepare failed for check: " . $conn->error);
        throw new Exception("Database error: " . $conn->error);
    }
    $checkStmt->bind_param("s", $email);
    if (!$checkStmt->execute()) {
        error_log("Verify Reset Code API: Execute failed for check: " . $checkStmt->error);
        throw new Exception("Database error: " . $checkStmt->error);
    }
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        error_log("Verify Reset Code API: No reset codes found for email: " . $email);
        echo json_encode([
            'success' => false, 
            'message' => 'No reset code found for this email. Please request a new code.'
        ]);
        $checkStmt->close();
        exit;
    }
    
    // Debug: Log all codes found for this email
    while ($row = $checkResult->fetch_assoc()) {
        error_log("Verify Reset Code API: Found code in DB: " . $row['reset_code'] . " for email: " . $row['email'] . ", expires: " . $row['expires_at']);
    }
    $checkStmt->close();
    
    // Check if the code exists and is valid
    $stmt = $conn->prepare("SELECT * FROM password_reset_codes WHERE email = ? AND reset_code = ? AND expires_at > NOW()");
    if (!$stmt) {
        error_log("Verify Reset Code API: Prepare failed: " . $conn->error);
        throw new Exception("Database error: " . $conn->error);
    }
    
    error_log("Verify Reset Code API: Checking if code matches. Email: $email, Code: $code");
    $stmt->bind_param("ss", $email, $code);
    if (!$stmt->execute()) {
        error_log("Verify Reset Code API: Execute failed: " . $stmt->error);
        throw new Exception("Database error: " . $stmt->error);
    }
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        error_log("Verify Reset Code API: Invalid or expired code for email: " . $email);
        
        // Check if there's a valid code but it doesn't match
        $validCodeStmt = $conn->prepare("SELECT reset_code FROM password_reset_codes WHERE email = ? AND expires_at > NOW()");
        $validCodeStmt->bind_param("s", $email);
        $validCodeStmt->execute();
        $validCodeResult = $validCodeStmt->get_result();
        
        if ($validCodeResult->num_rows > 0) {
            $validCode = $validCodeResult->fetch_assoc();
            error_log("Verify Reset Code API: Valid code exists but doesn't match. Valid code: " . $validCode['reset_code'] . ", Provided code: " . $code);
        } else {
            error_log("Verify Reset Code API: No valid code exists for this email or all codes have expired");
        }
        $validCodeStmt->close();
        
        echo json_encode([
            'success' => false, 
            'message' => 'Invalid or expired verification code. Please try again or request a new code.'
        ]);
        $stmt->close();
        exit;
    }
    
    $resetData = $result->fetch_assoc();
    $userId = $resetData['user_id'];
    error_log("Verify Reset Code API: Valid code found. User ID: " . $userId);
    $stmt->close();
    
    // Generate a unique token for this password reset request
    $resetToken = bin2hex(random_bytes(32));
    
    // Update the reset code record with this token
    $updateStmt = $conn->prepare("UPDATE password_reset_codes SET reset_token = ? WHERE id = ?");
    if (!$updateStmt) {
        error_log("Verify Reset Code API: Prepare failed for update: " . $conn->error);
        throw new Exception("Database error: " . $conn->error);
    }
    $updateStmt->bind_param("si", $resetToken, $resetData['id']);
    if (!$updateStmt->execute()) {
        error_log("Verify Reset Code API: Execute failed for update: " . $updateStmt->error);
        throw new Exception("Database error: " . $updateStmt->error);
    }
    $updateStmt->close();
    
    // Return success with the token for the next step
    error_log("Verify Reset Code API: Successfully verified code, returning token");
    echo json_encode([
        'success' => true, 
        'message' => 'Verification successful. You can now reset your password.',
        'data' => [
            'reset_token' => $resetToken,
            'user_id' => $userId
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Verify Reset Code API: Exception caught: " . $e->getMessage());
    error_log("Verify Reset Code API: Exception trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
}
?> 