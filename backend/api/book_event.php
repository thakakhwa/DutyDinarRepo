<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/book_event_error.log');

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php'; // Database connection
require_once 'send_email.php'; // Include email functionality once

// Simple placeholder for Google Wallet Pass function
function createGoogleWalletPass($eventId, $userId, $bookingId) {
    global $conn;
    
    try {
        // Include the Google Pass URL generator
        require_once __DIR__ . '/wallet/create_google_pass_url.php';
        
        // Use the new function to generate a proper Google Wallet URL
        $result = createGooglePassUrl($eventId, $userId, $bookingId);
        
        if (!$result['success']) {
            error_log("Error from Google Pass URL generator: " . ($result['message'] ?? 'Unknown error'));
            // Still return a URL even if there was an error, so the booking can proceed
            return [
                'success' => true,
                'wallet_url' => $result['wallet_url'],
                'pass_id' => 'mock-pass-google-' . $eventId . '-' . $bookingId . '-' . time(),
                'dev_mode' => true,
                'error_details' => $result['message'] ?? 'Unknown error'
            ];
        }
        
        // Return the result from the URL generator
        return [
            'success' => true,
            'wallet_url' => $result['wallet_url'],
            'pass_id' => $result['pass_id'],
            'dev_mode' => $result['dev_mode'] ?? true
        ];
    } catch (Exception $e) {
        error_log("Error creating Google Wallet pass: " . $e->getMessage());
        return [
            'success' => true, // Still return success to allow booking to proceed
            'wallet_url' => 'https://wallet.google/save/eventticket/?et=error_' . time(),
            'pass_id' => 'mock-pass-google-' . $eventId . '-' . $bookingId . '-' . time(),
            'dev_mode' => true,
            'error' => $e->getMessage()
        ];
    }
}

// New function for Apple Wallet Pass
function createAppleWalletPass($eventId, $userId, $bookingId) {
    global $conn;
    
    try {
        // Include the Apple Pass URL generator
        require_once __DIR__ . '/wallet/create_apple_pass_url.php';
        
        // Use the new function to generate a proper Apple Wallet URL
        $result = createApplePassUrl($eventId, $userId, $bookingId);
        
        if (!$result['success']) {
            error_log("Error from Apple Pass URL generator: " . ($result['message'] ?? 'Unknown error'));
            // Still return a URL even if there was an error, so the booking can proceed
            return [
                'success' => true,
                'wallet_url' => $result['wallet_url'],
                'pass_id' => 'mock-pass-apple-' . $eventId . '-' . $bookingId . '-' . time(),
                'dev_mode' => true,
                'error_details' => $result['message'] ?? 'Unknown error'
            ];
        }
        
        // Return the result from the URL generator
        return [
            'success' => true,
            'wallet_url' => $result['wallet_url'],
            'pass_id' => $result['pass_id'],
            'dev_mode' => $result['dev_mode'] ?? true
        ];
    } catch (Exception $e) {
        error_log("Error creating Apple Wallet pass: " . $e->getMessage());
        return [
            'success' => true, // Still return success to allow booking to proceed
            'wallet_url' => 'http://localhost/DutyDinarRepo/backend/api/wallet/download_pass.php?error=exception',
            'pass_id' => 'mock-pass-apple-' . $eventId . '-' . $bookingId . '-' . time(),
            'dev_mode' => true,
            'error' => $e->getMessage()
        ];
    }
}

// Function to send an email for event booking
function sendBookingEmail($to, $subject, $body) {
    // Log the email attempt
    error_log("Sending real event booking email to: $to, Subject: $subject");
    
    // Use the global sendEmail function from send_email.php
    return sendEmail($to, $subject, $body);
}

session_start();

function check_authentication() {
    if (!isset($_SESSION['userId'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized: No active session', 'auth_required' => true]);
        exit;
    }
    
    // Return both user ID and email if available
    $userData = ['id' => $_SESSION['userId']];
    
    if (isset($_SESSION['username'])) {
        $userData['email'] = $_SESSION['username'];
    }
    
    return $userData;
}

// Function to send booking confirmation email with wallet links
function sendBookingConfirmationEmail($userId, $eventId, $bookingId, $walletData, $orderId) {
    global $conn;
    
    try {
        // First check if we have the email in the session
        $userEmail = '';
        $userName = '';
        
        if (isset($_SESSION['username'])) {
            $userEmail = $_SESSION['username'];
            error_log("Using email from session: $userEmail");
        }
        
        // Get user and event details with error handling
        $query = "
            SELECT u.email, u.name as user_name, e.name as event_name, e.event_date, e.location 
            FROM users u
            JOIN events e ON e.id = ?
            WHERE u.id = ?
        ";
        
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            error_log("Email preparation error: " . $conn->error);
            return ['success' => false, 'message' => 'Database error: ' . $conn->error];
        }
        
        $stmt->bind_param("ii", $eventId, $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            error_log("User or event not found for email: User ID=$userId, Event ID=$eventId");
            return ['success' => false, 'message' => 'User or event not found'];
        }
        
        $data = $result->fetch_assoc();
        $stmt->close();
        
        // Use the session email if available, otherwise fall back to the database email
        if (empty($userEmail) && !empty($data['email'])) {
            $userEmail = $data['email'];
            error_log("Using email from database: $userEmail");
        }
        
        // Use name from the database
        $userName = $data['user_name'];
        
        // Make sure we have the user email
        if (empty($userEmail)) {
            error_log("User email is empty for User ID=$userId");
            return ['success' => false, 'message' => 'User email not found'];
        }
        
        // Log the user email we're sending to
        error_log("Sending confirmation email to: $userEmail for User ID=$userId");
        
        // Ensure we have valid wallet URLs
        $googleWalletUrl = $walletData['google_wallet_url'] ?? '';
        $appleWalletUrl = $walletData['apple_wallet_url'] ?? '';
        
        if (empty($googleWalletUrl) || $googleWalletUrl === '#') {
            error_log("Empty or invalid Google wallet URL provided. Generating new one in sendBookingConfirmationEmail");
            $wallet_result = createGoogleWalletPass($eventId, $userId, $bookingId);
            $googleWalletUrl = $wallet_result['wallet_url'];
            error_log("Generated new Google wallet URL: $googleWalletUrl");
        }
        
        if (empty($appleWalletUrl) || $appleWalletUrl === '#') {
            error_log("Empty or invalid Apple wallet URL provided. Generating new one in sendBookingConfirmationEmail");
            $wallet_result = createAppleWalletPass($eventId, $userId, $bookingId);
            $appleWalletUrl = $wallet_result['wallet_url'];
            error_log("Generated new Apple wallet URL: $appleWalletUrl");
        }
        
        // Format email
        $subject = "Your DutyDinar Event Booking Confirmation: " . $data['event_name'];
        
        $body = "
        <html>
        <head>
            <meta charset=\"utf-8\">
            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
            <title>Event Booking Confirmation</title>
            <style type=\"text/css\">
                /* Base styles */
                body, html {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 16px;
                    line-height: 1.5;
                }
                * {
                    -ms-text-size-adjust: 100%;
                    -webkit-text-size-adjust: 100%;
                }
                table {
                    border-spacing: 0;
                    mso-table-lspace: 0pt;
                    mso-table-rspace: 0pt;
                }
                table td {
                    border-collapse: collapse;
                }
                .ExternalClass {
                    width: 100%;
                }
                .ExternalClass,
                .ExternalClass p,
                .ExternalClass span,
                .ExternalClass font,
                .ExternalClass td,
                .ExternalClass div {
                    line-height: 100%;
                }
                /* Mobile specific styles */
                @media only screen and (max-width: 600px) {
                    .container {
                        width: 100% !important;
                    }
                    .content {
                        padding: 15px !important;
                    }
                    .button-container {
                        width: 100% !important;
                    }
                    .button {
                        width: 100% !important;
                        padding: 15px 0 !important;
                    }
                    img {
                        max-width: 100% !important;
                        height: auto !important;
                    }
                }
            </style>
        </head>
        <body style=\"margin: 0; padding: 0; background-color: #f7f7f7;\">
            <!-- Email Container -->
            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
                <tr>
                    <td align=\"center\" style=\"padding: 20px 0;\">
                        <!-- Email Content Container -->
                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"600\" style=\"background-color: #ffffff; border-radius: 5px; box-shadow: 0 3px 6px rgba(0,0,0,0.1);\">
                            <!-- Header -->
                            <tr>
                                <td align=\"center\" bgcolor=\"#4CAF50\" style=\"padding: 20px; border-radius: 5px 5px 0 0; color: white;\">
                                    <h1 style=\"margin: 0; font-size: 24px;\">Event Booking Confirmation</h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style=\"padding: 30px;\">
                                    <p>Hello " . $userName . ",</p>
                                    <p>Thank you for booking a ticket for <strong>" . $data['event_name'] . "</strong>!</p>
                                    
                                    <!-- Event Details -->
                                    <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color: #f9f9f9; border-left: 4px solid #4CAF50; margin: 20px 0; padding: 15px; border-radius: 5px;\">
                                        <tr>
                                            <td>
                                                <h3 style=\"margin-top: 0;\">Event Details:</h3>
                                                <p><strong>Event:</strong> " . $data['event_name'] . "</p>
                                                <p><strong>Date:</strong> " . date('F j, Y, g:i a', strtotime($data['event_date'])) . "</p>
                                                <p><strong>Location:</strong> " . $data['location'] . "</p>
                                                <p><strong>Booking ID:</strong> " . $bookingId . "</p>
                                                <p style=\"margin-bottom: 0;\"><strong>Order ID:</strong> " . $orderId . "</p>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Wallet Buttons Section -->
                                    <p style=\"text-align: center; margin: 25px 0 15px 0;\">Add this event ticket to your digital wallet:</p>
                                    
                                    <!-- Google Wallet Button -->
                                    <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"margin-bottom: 15px;\">
                                        <tr>
                                            <td align=\"center\">
                                                <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\">
                                                    <tr>
                                                        <td align=\"center\" bgcolor=\"#4285F4\" style=\"border-radius: 4px;\">";
        
        // Log the Google wallet URL right before embedding it in the email
        error_log("Embedding Google wallet URL in email button: " . $googleWalletUrl);
        
        $body .= "
                                                            <a href=\"" . htmlspecialchars($googleWalletUrl, ENT_QUOTES, 'UTF-8') . "\" target=\"_blank\" style=\"display: inline-block; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; text-align: center; padding: 15px 30px; border-radius: 4px;\">
                                                                Add to Google Wallet
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Apple Wallet Button -->
                                    <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"margin-bottom: 25px;\">
                                        <tr>
                                            <td align=\"center\">
                                                <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\">
                                                    <tr>
                                                        <td align=\"center\" bgcolor=\"#000000\" style=\"border-radius: 4px;\">";
        
        // Log the Apple wallet URL right before embedding it in the email
        error_log("Embedding Apple wallet URL in email button: " . $appleWalletUrl);
        
        $body .= "
                                                            <a href=\"" . htmlspecialchars($appleWalletUrl, ENT_QUOTES, 'UTF-8') . "\" target=\"_blank\" style=\"display: inline-block; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; text-align: center; padding: 15px 30px; border-radius: 4px;\">
                                                                Add to Apple Wallet
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Footer -->
                                    <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;\">
                                        <tr>
                                            <td style=\"color: #666666; font-size: 14px;\">
                                                <p>We look forward to seeing you at the event!</p>
                                                <p>Best regards,<br>The DutyDinar Team</p>
                                                <p style=\"font-size: 12px;\">If you have any questions about your booking, please contact us at support@dutydinar.com</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        ";
        
        // Send the email to the user's email address from session
        return sendBookingEmail($userEmail, $subject, $body);
    } catch (Exception $e) {
        error_log("Error in sendBookingConfirmationEmail: " . $e->getMessage());
        return ['success' => false, 'message' => 'Error sending email: ' . $e->getMessage()];
    }
}

// Ensure user is authenticated
$userData = check_authentication();

// Now proceed with booking logic
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get the authenticated user's ID
        $user_id = $userData['id'];
        
        // Log the user's email from session
        if (isset($userData['email'])) {
            error_log("Authenticated user email: " . $userData['email']);
        } else {
            error_log("No email found in user session");
        }

        $inputData = json_decode(file_get_contents("php://input"), true);

        if (empty($inputData['event_id']) || empty($inputData['quantity'])) {
            echo json_encode(['success' => false, 'message' => 'Event ID and quantity are required.']);
            exit;
        }

        $event_id = (int)$inputData['event_id'];
        $quantity = (int)$inputData['quantity'];

        // Check event availability and price
        $event_stmt = $conn->prepare("SELECT available_tickets FROM events WHERE id = ?");
        if (!$event_stmt) {
            echo json_encode(['success' => false, 'message' => 'Failed to prepare event query.']);
            exit;
        }
        $event_stmt->bind_param("i", $event_id);
        $event_stmt->execute();
        $event_result = $event_stmt->get_result();
        if ($event_result->num_rows === 0) {
            echo json_encode(['success' => false, 'message' => 'Event not found.']);
            exit;
        }
        $event = $event_result->fetch_assoc();
        $available_tickets = (int)$event['available_tickets'];
        $event_stmt->close();

        if ($quantity > $available_tickets) {
            echo json_encode(['success' => false, 'message' => 'Not enough tickets available.']);
            exit;
        }

        // Start transaction
        $conn->begin_transaction();

        // Insert into orders table
        $order_stmt = $conn->prepare("INSERT INTO orders (buyer_id, order_type, total_amount, status) VALUES (?, 'event', ?, 'pending')");
        if (!$order_stmt) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Failed to prepare order insert.']);
            exit;
        }
        $total_amount = 0;
        $order_stmt->bind_param("id", $user_id, $total_amount);
        if (!$order_stmt->execute()) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Failed to create order.']);
            exit;
        }
        $order_id = $conn->insert_id;
        $order_stmt->close();

        // Insert into order_items table
        $item_stmt = $conn->prepare("INSERT INTO order_items (order_id, event_id, quantity, price) VALUES (?, ?, ?, ?)");
        if (!$item_stmt) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Failed to prepare order item insert.']);
            exit;
        }
        $price = 0;
        $item_stmt->bind_param("iiid", $order_id, $event_id, $quantity, $price);
        if (!$item_stmt->execute()) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Failed to add order item.']);
            exit;
        }
        $item_stmt->close();

        // Update available tickets
        $update_stmt = $conn->prepare("UPDATE events SET available_tickets = available_tickets - ? WHERE id = ?");
        if (!$update_stmt) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Failed to prepare tickets update.']);
            exit;
        }
        $update_stmt->bind_param("ii", $quantity, $event_id);
        if (!$update_stmt->execute()) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Failed to update tickets.']);
            exit;
        }
        $update_stmt->close();

        // Check if user already booked this event
        $check_stmt = $conn->prepare("SELECT quantity FROM event_bookings WHERE user_id = ? AND event_id = ?");
        if (!$check_stmt) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Failed to prepare booking check.']);
            exit;
        }
        $check_stmt->bind_param("ii", $user_id, $event_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        if ($check_result && $check_result->num_rows > 0) {
            $check_row = $check_result->fetch_assoc();
            if ((int)$check_row['quantity'] >= 1) {
                $conn->rollback();
                echo json_encode(['success' => false, 'message' => 'You have already booked a ticket for this event.']);
                exit;
            }
        }
        $check_stmt->close();

        // Insert booking record with quantity 1
        $booking_stmt = $conn->prepare("INSERT INTO event_bookings (user_id, event_id, quantity) VALUES (?, ?, 1)");
        if (!$booking_stmt) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Failed to prepare event booking insert.']);
            exit;
        }
        $booking_stmt->bind_param("ii", $user_id, $event_id);
        if (!$booking_stmt->execute()) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Failed to insert event booking.']);
            exit;
        }
        $booking_id = $conn->insert_id;
        $booking_stmt->close();

        $conn->commit();
        
        // Complete the booking with optional wallet passes and email
        $response = [
            'success' => true, 
            'message' => 'Event booked successfully.', 
            'order_id' => $order_id,
            'booking_id' => $booking_id
        ];
        
        // Generate Google Wallet pass
        error_log("Generating Google Wallet pass for booking ID: $booking_id");
        $google_wallet_result = createGoogleWalletPass($event_id, $user_id, $booking_id);
        
        if ($google_wallet_result['success']) {
            $response['google_wallet_url'] = $google_wallet_result['wallet_url'];
            error_log("Successfully generated Google wallet URL: " . $google_wallet_result['wallet_url']);
        } else {
            error_log("Failed to generate Google wallet pass. Using fallback URL.");
            $google_wallet_result['wallet_url'] = 'https://wallet.google/save/eventticket/?et=booking_' . $booking_id . '_' . time();
            $response['google_wallet_url'] = $google_wallet_result['wallet_url'];
        }
        
        // Generate Apple Wallet pass
        error_log("Generating Apple Wallet pass for booking ID: $booking_id");
        $apple_wallet_result = createAppleWalletPass($event_id, $user_id, $booking_id);
        
        if ($apple_wallet_result['success']) {
            $response['apple_wallet_url'] = $apple_wallet_result['wallet_url'];
            error_log("Successfully generated Apple wallet URL: " . $apple_wallet_result['wallet_url']);
        } else {
            error_log("Failed to generate Apple wallet pass. Using fallback URL.");
            $apple_wallet_result['wallet_url'] = 'https://dutydinar.com/apple-wallet/passes/event_' . $booking_id . '_' . time();
            $response['apple_wallet_url'] = $apple_wallet_result['wallet_url'];
        }
        
        // For backward compatibility with existing frontend code
        $response['wallet_url'] = $response['google_wallet_url'];
        
        // Always try to send the confirmation email regardless of wallet pass
        try {
            // Get the user's email directly from the session if available
            $userEmail = isset($_SESSION['username']) ? $_SESSION['username'] : null;
            
            // Log the email we're attempting to use
            if ($userEmail) {
                error_log("Using session email for confirmation: $userEmail");
            } else {
                error_log("No session email found, will try to get from database");
            }
            
            // Send the confirmation email with order ID included
            $email_result = sendBookingConfirmationEmail($user_id, $event_id, $booking_id, $response, $order_id);
            
            // Log email sending result for debugging
            error_log("Email sending result: " . json_encode($email_result));
            
            // Add email status to the response
            if (!empty($email_result['success'])) {
                $response['email_sent'] = true;
                $response['email_status'] = 'sent';
            } else {
                $response['email_sent'] = false;
                $response['email_status'] = 'failed';
                if (!empty($email_result['error'])) {
                    error_log("Email error: " . $email_result['error']);
                    $response['email_error'] = $email_result['error'];
                }
            }
        } catch (Exception $emailError) {
            error_log("Email sending failed: " . $emailError->getMessage());
            $response['email_sent'] = false;
            $response['email_status'] = 'exception';
            $response['email_error'] = 'Failed to send email: ' . $emailError->getMessage();
        }
        
        // Send the final response
        echo json_encode($response);

    } catch (Exception $e) {
        // Rollback transaction if it's active
        if (isset($conn) && $conn->connect_errno === 0) {
            try {
                $conn->rollback();
            } catch (Exception $rollbackError) {
                error_log("Rollback failed: " . $rollbackError->getMessage());
            }
        }
        
        error_log("Book Event API error: " . $e->getMessage());
        echo json_encode([
            'success' => false, 
            'message' => 'Internal server error.',
            'error' => $e->getMessage()
        ]);
    }
}
?>
