<?php

// Try to load Composer's autoloader from various possible locations
$autoload_paths = [
    __DIR__ . '/vendor/autoload.php',
    __DIR__ . '/../vendor/autoload.php',
    $_SERVER['DOCUMENT_ROOT'] . '/DutyDinarRepo/backend/vendor/autoload.php',
    __DIR__ . '/../../vendor/autoload.php'
];

$autoloader_loaded = false;
foreach ($autoload_paths as $path) {
    if (file_exists($path)) {
        require_once $path;
        $autoloader_loaded = true;
        break;
    }
}

// Only use PHPMailer if available
$phpmailer_available = class_exists('PHPMailer\PHPMailer\PHPMailer') && 
                     class_exists('PHPMailer\PHPMailer\Exception');

require_once "config.php";

// Try to load email credentials but don't fail if missing
try {
    require_once(__DIR__ . "/../controller/email_cred.php"); // Email credentials
} catch (Exception $e) {
    // Default fallback values if credentials file is missing
    error_log("Email credentials file missing: " . $e->getMessage());
    $email_username = "noreply@dutydinar.com";
    $email_password = "";
    $email_name = "Duty Dinar";
    $host = 'smtp.titan.email';
    $port = 465;
    $reply_to_email_username = "support@dutydinar.com";
    $reply_to_email_name = "Duty Dinar Support";
    $SMTPSecure = 'ssl';
}

// Validation functions
function validate_request_method($method) {
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        header('HTTP/1.1 405 Method Not Allowed');
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        exit;
    }
}

function validate_request_body($method, $required_fields = []) {
    if ($method === 'POST' || $method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
            exit;
        }
        
        foreach ($required_fields as $field) {
            if (!isset($input[$field])) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
                exit;
            }
        }
        
        return $input;
    }
    
    return $_GET;
}

// Function to send an email
function sendEmail($email, $subject, $body)
{
    global $email_username, $email_password, $email_name, $host, $port, 
           $reply_to_email_username, $reply_to_email_name, $SMTPSecure,
           $autoloader_loaded, $phpmailer_available;
    
    // Check if PHPMailer is available
    if (!$autoloader_loaded || !$phpmailer_available) {
        error_log("PHPMailer not available. Email not sent.");
        return [
            "success" => false,
            "message" => "Email functionality not available.",
            "error" => "Required libraries missing"
        ];
    }
    
    // Check if we have valid credentials
    if (empty($email_username) || empty($email_password)) {
        error_log("Email credentials missing. Cannot send email.");
        return [
            "success" => false,
            "message" => "Email credentials missing.",
            "error" => "Missing email configuration"
        ];
    }

    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        $mail->isSMTP();
        $mail->Host = $host;
        $mail->SMTPAuth = true;
        $mail->Username = $email_username;
        $mail->Password = $email_password;
        $mail->SMTPSecure = $SMTPSecure;
        $mail->Port = $port;

        $mail->setFrom($email_username, $email_name);
        $mail->addAddress($email);
        $mail->addReplyTo($reply_to_email_username, $reply_to_email_name);

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;

        $mail->send();
        // Return a proper JSON response instead of printing
        return [
            "success" => true,
            "message" => "Email sent successfully."
        ];
    } catch (Exception $e) {
        error_log("Error sending email: " . $e->getMessage());
        return [
            "success" => false,
            "message" => "Failed to send email. Please try again.",
            "error" => $e->getMessage()
        ];
    }
}

// If this file is called directly, handle the email request
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    // Handle incoming API requests
    header('Content-Type: application/json');
    validate_request_method("POST");
    $input = validate_request_body("POST", ['email', 'subject', 'body']);

    // Send email
    $response = sendEmail($input['email'], $input['subject'], $input['body']);
    echo json_encode($response);
    exit;
}
?> 