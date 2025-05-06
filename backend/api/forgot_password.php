<?php
require_once 'config.php';
require_once 'cors.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);

if (empty($input['email'])) {
    error_log("Forgot Password API: Email is required but missing in request");
    http_response_code(400);
    print_response(false, 'Email is required');
    exit;
}

$email = $input['email'];

try {
    // Check if user exists
    error_log("Forgot Password API: Checking user existence for email: " . $email);
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
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
        // For security, do not reveal if email does not exist
        print_response(true, 'If this email is registered, you will receive password reset instructions.');
        exit;
    }
    $user = $result->fetch_assoc();
    $userId = $user['id'];
    $stmt->close();

    // Generate a temporary password
    $tempPassword = bin2hex(random_bytes(4)); // 8 characters
    error_log("Forgot Password API: Generated temporary password for email " . $email);
    $hashedPassword = password_hash($tempPassword, PASSWORD_DEFAULT);

    // Update user's password with temporary password
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    if (!$stmt) {
        error_log("Forgot Password API: Prepare failed for update: " . $conn->error);
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param("si", $hashedPassword, $userId);
    if (!$stmt->execute()) {
        error_log("Forgot Password API: Execute failed for update: " . $stmt->error);
        throw new Exception("Execute failed: " . $stmt->error);
    }
    $stmt->close();

$baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]" . dirname($_SERVER['SCRIPT_NAME']);
$sendEmailUrl = $baseUrl . "/send_email.php";

$emailSubject = 'Password Reset Request';
$emailBody = "Your temporary password is: <b>{$tempPassword}</b><br>Please log in and change your password immediately.";

$postData = json_encode([
    'email' => $email,
    'subject' => $emailSubject,
    'body' => $emailBody
]);

$ch = curl_init($sendEmailUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($postData)
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Debugging logs
error_log("Forgot Password API: curl response: " . $response);
error_log("Forgot Password API: HTTP code: " . $httpCode);
error_log("Forgot Password API: curl error: " . $curlError);

if ($response === false) {
    http_response_code(500);
    print_response(false, "Curl error: $curlError");
    exit;
}

$responseData = json_decode($response, true);
if ($httpCode === 200 && isset($responseData['success']) && $responseData['success'] === true) {
    print_response(true, 'If this email is registered, you will receive password reset instructions.');
} else {
    http_response_code(500);
    $errorMessage = $responseData['message'] ?? 'Failed to send email';
    print_response(false, $errorMessage);
}
} catch (Exception $e) {
    error_log("Forgot Password API: Exception caught: " . $e->getMessage());
    http_response_code(500);
    print_response(false, $e->getMessage());
}
?>
