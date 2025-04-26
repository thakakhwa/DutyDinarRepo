<?php
require_once 'config.php';
require_once 'cors.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);

if (empty($input['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email is required']);
    exit;
}

$email = $input['email'];

try {
    // Check if user exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param("s", $email);
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        // For security, do not reveal if email does not exist
        echo json_encode(['success' => true, 'message' => 'If this email is registered, you will receive password reset instructions.']);
        exit;
    }
    $user = $result->fetch_assoc();
    $userId = $user['id'];
    $stmt->close();

    // Generate a temporary password
    $tempPassword = bin2hex(random_bytes(4)); // 8 characters
    $hashedPassword = password_hash($tempPassword, PASSWORD_DEFAULT);

    // Update user's password with temporary password
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param("si", $hashedPassword, $userId);
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    $stmt->close();

    // Send email with temporary password using PHPMailer
    $mail = new PHPMailer(true);

    try {
        //Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; // Updated SMTP server to Gmail
        $mail->SMTPAuth   = true;
        $mail->Username   = 'your_gmail_username@gmail.com'; // TODO: Replace with your Gmail address
        $mail->Password   = 'your_gmail_app_password'; // TODO: Replace with your Gmail app password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;

        //Recipients
        $mail->setFrom('no-reply@dutydinar.com', 'DutyDinar Support');
        $mail->addAddress($email);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Password Reset Request';
        $mail->Body    = "Your temporary password is: <b>{$tempPassword}</b><br>Please log in and change your password immediately.";
        $mail->AltBody = "Your temporary password is: {$tempPassword}. Please log in and change your password immediately.";

        $mail->send();

        echo json_encode(['success' => true, 'message' => 'If this email is registered, you will receive password reset instructions.']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => "Mailer Error: {$mail->ErrorInfo}"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
