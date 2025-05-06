<?php
// Set error reporting to maximum level for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Debug log for request
error_log("Forgot Password API: Received request. Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Forgot Password API: Request headers: " . json_encode(getallheaders()));

// This is a standalone CORS handler that doesn't load any dependencies 
// and just handles the preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    require_once 'cors_handler.php';
    exit;
}

// Debug log for main request processing
error_log("Forgot Password API: Processing main request");

// For normal requests, we can use the full flow
require_once 'config.php';
require_once 'cors.php';
// Use real email instead of mock
require_once 'send_email.php';

// Set CORS headers explicitly again for the main request
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

header('Content-Type: application/json');

// Debug log for request body
$raw_input = file_get_contents("php://input");
error_log("Forgot Password API: Raw request body: " . $raw_input);

$input = json_decode($raw_input, true);
error_log("Forgot Password API: Parsed request body: " . json_encode($input));

if (empty($input['email'])) {
    error_log("Forgot Password API: Email is required but missing in request");
    http_response_code(400);
    send_response(false, 'Email is required');
    exit;
}

$email = $input['email'];

try {
    // Check if user exists
    error_log("Forgot Password API: Checking user existence for email: " . $email);
    $stmt = $conn->prepare("SELECT id, name FROM users WHERE email = ?");
    if (!$stmt) {
        error_log("Forgot Password API: Prepare failed: " . $conn->error);
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param("s", $email);
    if (!$stmt->execute()) {
        error_log("Forgot Password API: Execute failed: " . $stmt->error);
        throw new Exception("Execute failed: " . $stmt->error);
    }
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        error_log("Forgot Password API: Email not found: " . $email);
        // For security, do not reveal if email does not exist in the message
        // But do include this information in the data field for the frontend
        send_response(true, 'If this email is registered, you will receive a verification code.', ['exists' => false]);
        exit;
    }
    $user = $result->fetch_assoc();
    $userId = $user['id'];
    $userName = $user['name'];
    $stmt->close();

    // Generate a 6-digit verification code
    $verificationCode = sprintf("%06d", mt_rand(100000, 999999));
    error_log("Forgot Password API: Generated verification code for email " . $email . ": " . $verificationCode);
    
    // Check if the table exists, if not create it
    $createTableSql = "CREATE TABLE IF NOT EXISTS `password_reset_codes` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `user_id` int(11) NOT NULL,
        `email` varchar(255) NOT NULL,
        `reset_code` varchar(6) NOT NULL,
        `reset_token` varchar(64) DEFAULT NULL,
        `expires_at` datetime NOT NULL,
        `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (`id`),
        KEY `email` (`email`),
        KEY `user_id` (`user_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    
    if (!$conn->query($createTableSql)) {
        error_log("Forgot Password API: Failed to create password_reset_codes table: " . $conn->error);
        // Continue even if table creation fails as it might already exist
    }

    // Delete any existing verification codes for this user
    $deleteStmt = $conn->prepare("DELETE FROM password_reset_codes WHERE user_id = ?");
    if ($deleteStmt) {
        $deleteStmt->bind_param("i", $userId);
        $deleteStmt->execute();
        error_log("Forgot Password API: Deleted existing verification codes for user ID: " . $userId);
        $deleteStmt->close();
    }

    // Set expiration time (30 minutes from now)
    $expiresAt = date('Y-m-d H:i:s', strtotime('+30 minutes'));
    
    // Store the verification code in the database
    $insertStmt = $conn->prepare("INSERT INTO password_reset_codes (user_id, email, reset_code, expires_at) VALUES (?, ?, ?, ?)");
    if (!$insertStmt) {
        error_log("Forgot Password API: Prepare failed for insert: " . $conn->error);
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $insertStmt->bind_param("isss", $userId, $email, $verificationCode, $expiresAt);
    if (!$insertStmt->execute()) {
        error_log("Forgot Password API: Execute failed for insert: " . $insertStmt->error);
        throw new Exception("Execute failed: " . $insertStmt->error);
    }
    error_log("Forgot Password API: Inserted verification code into database. Code: " . $verificationCode . ", Expires: " . $expiresAt);
    $insertStmt->close();

    // Verify that the code was inserted correctly
    $verifyStmt = $conn->prepare("SELECT * FROM password_reset_codes WHERE user_id = ? AND email = ? ORDER BY created_at DESC LIMIT 1");
    if ($verifyStmt) {
        $verifyStmt->bind_param("is", $userId, $email);
        $verifyStmt->execute();
        $verifyResult = $verifyStmt->get_result();
        if ($verifyResult->num_rows > 0) {
            $codeData = $verifyResult->fetch_assoc();
            error_log("Forgot Password API: Verification of code insertion - Found code: " . $codeData['reset_code'] . ", Expires: " . $codeData['expires_at']);
        } else {
            error_log("Forgot Password API: WARNING - Could not verify code insertion");
        }
        $verifyStmt->close();
    }

    // Generate email template with verification code
    $emailSubject = 'DutyDinar Password Reset Verification Code';
    $emailBody = "
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            .header {
                background-color: #4CAF50;
                color: white;
                padding: 15px;
                text-align: center;
                border-radius: 5px 5px 0 0;
            }
            .content {
                padding: 20px;
            }
            .code {
                font-size: 32px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
                letter-spacing: 5px;
                color: #4CAF50;
            }
            .footer {
                font-size: 12px;
                color: #777;
                text-align: center;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #eee;
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>Password Reset Request</h2>
            </div>
            <div class='content'>
                <p>Hello {$userName},</p>
                <p>We received a request to reset your password for your DutyDinar account. To proceed with the password reset, please use the following verification code:</p>
                <div class='code'>{$verificationCode}</div>
                <p>This code will expire in 30 minutes for security reasons.</p>
                <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                <p>Thank you,<br>The DutyDinar Team</p>
            </div>
            <div class='footer'>
                <p>This is an automated message, please do not reply. For any questions, contact support@dutydinar.com</p>
            </div>
        </div>
    </body>
    </html>
    ";

    // Send the email with the verification code
    error_log("Forgot Password API: Attempting to send email to: " . $email);
    $emailResult = sendEmail($email, $emailSubject, $emailBody);
    error_log("Forgot Password API: Email result: " . json_encode($emailResult));
    
    if (!$emailResult['success']) {
        error_log("Forgot Password API: Email sending failed: " . json_encode($emailResult));
        throw new Exception("Failed to send email: " . ($emailResult['error'] ?? "Unknown error"));
    }
    
    // Return success response with exists=true for the frontend to know the email exists
    error_log("Forgot Password API: Successfully processed request, returning success response");
    send_response(true, 'If this email is registered, you will receive a verification code.', [
        'exists' => true,
        'code' => $verificationCode // For testing purposes, include the verification code in the response
    ]);

} catch (Exception $e) {
    error_log("Forgot Password API: Exception caught: " . $e->getMessage());
    error_log("Forgot Password API: Exception trace: " . $e->getTraceAsString());
    http_response_code(500);
    send_response(false, $e->getMessage());
}

// Function renamed from print_response to send_response to avoid conflicts
function send_response($success, $message, $data = null) {
    $response = json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    error_log("Forgot Password API: Sending response: " . $response);
    echo $response;
}
?>
