<?php
/**
 * Mock email function for testing purposes
 * Use this file when PHPMailer is not available or has permission issues
 */

function sendEmail($email, $subject, $body)
{
    // Log the email attempt
    error_log("MOCK EMAIL: To: $email, Subject: $subject");
    error_log("MOCK EMAIL: Body: " . substr($body, 0, 200) . "...");
    
    // Check if the email is valid
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        error_log("MOCK EMAIL: Invalid email address: $email");
        return [
            "success" => false,
            "message" => "Invalid email address.",
            "error" => "Email validation failed"
        ];
    }
    
    // Check if the email is from a test domain
    if (strpos($email, '@example.com') !== false || 
        strpos($email, '@test.com') !== false) {
        error_log("MOCK EMAIL: Test domain detected, but proceeding for test purposes");
    }
    
    // Store the email details in a file for verification - try multiple locations
    $logFile = '/tmp/duty_dinar_email_log.txt';
    $logEntry = date('Y-m-d H:i:s') . " | To: $email | Subject: $subject\n";
    
    if (file_put_contents($logFile, $logEntry, FILE_APPEND)) {
        error_log("MOCK EMAIL: Log written to $logFile");
    } else {
        error_log("MOCK EMAIL: Failed to write to $logFile");
        
        // Try alternate location
        $logFile = __DIR__ . '/email_log.txt';
        if (file_put_contents($logFile, $logEntry, FILE_APPEND)) {
            error_log("MOCK EMAIL: Log written to $logFile");
        } else {
            error_log("MOCK EMAIL: Failed to write to $logFile");
            
            // Try one more location
            $logFile = sys_get_temp_dir() . '/duty_dinar_email_log.txt';
            if (file_put_contents($logFile, $logEntry, FILE_APPEND)) {
                error_log("MOCK EMAIL: Log written to $logFile");
            } else {
                error_log("MOCK EMAIL: Failed to write log file. Paths attempted: /tmp/duty_dinar_email_log.txt, " . __DIR__ . "/email_log.txt, " . sys_get_temp_dir() . "/duty_dinar_email_log.txt");
            }
        }
    }
    
    // Return success
    return [
        "success" => true,
        "message" => "Mock email sent successfully. (Note: No actual email was sent, this is for testing only)",
        "data" => [
            "to" => $email,
            "subject" => $subject,
            "sent_at" => date('Y-m-d H:i:s')
        ]
    ];
}
?> 