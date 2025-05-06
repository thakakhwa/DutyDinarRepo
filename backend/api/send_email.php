<?php
// Simple mock email service for development
require_once "config.php";

// Load email credentials or use defaults
$email_username = "noreply@dutydinar.com";
$email_password = "";
$email_name = "Duty Dinar";
$reply_to_email_username = "support@dutydinar.com";
$reply_to_email_name = "Duty Dinar Support";

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

// Function to send an email - in development this just logs
function sendEmail($email, $subject, $body) {
    error_log("MOCK EMAIL: To: $email, Subject: $subject");
    
    // In a development environment, just pretend we sent the email
    return [
        "success" => true,
        "message" => "Email sent successfully (mock).",
        "mock" => true
    ];
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