<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require('PHPMailer/PHPMailer/src/Exception.php');
require('PHPMailer/PHPMailer/src/PHPMailer.php');
require('PHPMailer/PHPMailer/src/SMTP.php');

require_once "config.php";
require_once("../controls/email_cred.php"); // Function to validate request data


// Function to send an email
function sendEmail($email, $subject, $body)
{
    global $email_username, $email_password, $email_name, $host, $port, $reply_to_email_username, $reply_to_email_name, $SMTPSecure;

    $mail = new PHPMailer(true);
    
    try {
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

// Handle incoming API requests
$request_method = "POST";
validate_request_method($request_method);
$input = validate_request_body($request_method, ['email', 'subject', 'body']);

// Send email
$response = sendEmail($input['email'], $input['subject'], $input['body']);
echo json_encode($response);
exit;