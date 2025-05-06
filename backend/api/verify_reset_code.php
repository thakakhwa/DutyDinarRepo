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

// Normalize codes by removing leading zeros - some databases may store them differently
$normalizedCode = ltrim($code, '0');
if (empty($normalizedCode)) {
    // If the code was all zeros (like 000123), then keep at least one zero
    $normalizedCode = '0';
}

error_log("Verify Reset Code API: Processing request for email: $email, code: $code, normalized: $normalizedCode");

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
        // Normalize stored code for comparison
        $storedCode = ltrim($row['reset_code'], '0');
        error_log("Verify Reset Code API: Found code in DB: " . $row['reset_code'] . " (normalized: $storedCode) for email: " . $row['email'] . ", expires: " . $row['expires_at']);
    }
    $checkStmt->close();
    
    // Get the current time in the server's timezone
    $currentTime = date('Y-m-d H:i:s');
    error_log("Verify Reset Code API: Current server time: " . $currentTime);
    
    // Check if the code exists and is valid - using PHP time check instead of MySQL NOW()
    $stmt = $conn->prepare("
        SELECT * FROM password_reset_codes 
        WHERE email = ? 
        AND (
            reset_code = ? 
            OR reset_code = ? 
            OR CAST(reset_code AS UNSIGNED) = CAST(? AS UNSIGNED)
        )
    ");
    if (!$stmt) {
        error_log("Verify Reset Code API: Prepare failed: " . $conn->error);
        throw new Exception("Database error: " . $conn->error);
    }
    
    error_log("Verify Reset Code API: Checking if code matches. Email: $email, Code: $code, Normalized: $normalizedCode");
    $stmt->bind_param("ssss", $email, $code, $normalizedCode, $code);
    if (!$stmt->execute()) {
        error_log("Verify Reset Code API: Execute failed: " . $stmt->error);
        throw new Exception("Database error: " . $stmt->error);
    }
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        error_log("Verify Reset Code API: No matching code found for email: " . $email);
        // Check if there's a valid code but it doesn't match
        $validCodeStmt = $conn->prepare("SELECT reset_code, expires_at FROM password_reset_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1");
        $validCodeStmt->bind_param("s", $email);
        $validCodeStmt->execute();
        $validCodeResult = $validCodeStmt->get_result();
        
        if ($validCodeResult->num_rows > 0) {
            $validCode = $validCodeResult->fetch_assoc();
            error_log("Verify Reset Code API: Most recent code for email: " . $validCode['reset_code']);
            error_log("Verify Reset Code API: Provided code: " . $code);
            error_log("Verify Reset Code API: Normalized provided code: " . $normalizedCode);
            
            // Now manually check the expiration
            $expiresAt = $validCode['expires_at'];
            $isExpired = strtotime($expiresAt) <= time();
            
            error_log("Verify Reset Code API: Code expires at: " . $expiresAt . ", Current time: " . $currentTime);
            error_log("Verify Reset Code API: Code is " . ($isExpired ? "expired" : "valid"));
            
            // Close the valid code statement
            $validCodeStmt->close();
            
            // Just show the error for now, don't try to use the code
            echo json_encode([
                'success' => false, 
                'message' => 'Invalid or expired verification code. Please try again or request a new code.'
            ]);
            $stmt->close();
            exit;
        } else {
            error_log("Verify Reset Code API: No codes found for this email");
        }
        echo json_encode([
            'success' => false, 
            'message' => 'Invalid or expired verification code. Please try again or request a new code.'
        ]);
        $stmt->close();
        exit;
    }
    
    $resetData = $result->fetch_assoc();
    
    // Now manually check the expiration
    $expiresAt = $resetData['expires_at'];
    $isExpired = strtotime($expiresAt) <= time();
    
    error_log("Verify Reset Code API: Code expires at: " . $expiresAt . ", Current time: " . $currentTime);
    error_log("Verify Reset Code API: Code is " . ($isExpired ? "expired" : "valid"));
    
    if ($isExpired) {
        error_log("Verify Reset Code API: Expired code for email: " . $email);
        echo json_encode([
            'success' => false, 
            'message' => 'Verification code has expired. Please request a new code.'
        ]);
        $stmt->close();
        exit;
    }
    
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