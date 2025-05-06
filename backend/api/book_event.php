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

// Simple placeholder for Google Wallet Pass function
function createGoogleWalletPass($eventId, $userId, $bookingId) {
    return [
        'success' => true,
        'wallet_url' => 'https://pay.google.com/gp/v/save/example_pass_' . time(),
        'pass_id' => 'mock-pass-' . $eventId . '-' . $bookingId . '-' . time(),
        'dev_mode' => true
    ];
}

// Simple placeholder for email function
function sendEmail($to, $subject, $body) {
    error_log("MOCK EMAIL: To: $to, Subject: $subject");
    return [
        "success" => true,
        "message" => "Email sent successfully (mock).",
        "mock" => true
    ];
}

session_start();

function check_authentication() {
    if (!isset($_SESSION['userId'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized: No active session']);
        exit;
    }
    return ['id' => $_SESSION['userId']];
}

// Function to send booking confirmation email with Google Wallet link
function sendBookingConfirmationEmail($userId, $eventId, $bookingId, $walletUrl) {
    global $conn;
    
    try {
        // Get user and event details
        $query = "
            SELECT u.email, u.name as user_name, e.name as event_name, e.event_date, e.location 
            FROM users u
            JOIN events e ON e.id = ?
            WHERE u.id = ?
        ";
        
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            error_log("Email preparation error: " . $conn->error);
            return ['success' => false, 'message' => 'Database error'];
        }
        
        $stmt->bind_param("ii", $eventId, $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            return ['success' => false, 'message' => 'User or event not found'];
        }
        
        $data = $result->fetch_assoc();
        $stmt->close();
        
        // Format email
        $subject = "Your DutyDinar Event Booking Confirmation: " . $data['event_name'];
        
        $body = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; }
                .content { padding: 20px; border: 1px solid #ddd; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Event Booking Confirmation</h1>
                </div>
                <div class='content'>
                    <p>Hello " . $data['user_name'] . ",</p>
                    <p>Thank you for booking a ticket for <strong>" . $data['event_name'] . "</strong>!</p>
                    
                    <div>
                        <h3>Event Details:</h3>
                        <p><strong>Event:</strong> " . $data['event_name'] . "</p>
                        <p><strong>Date:</strong> " . date('F j, Y, g:i a', strtotime($data['event_date'])) . "</p>
                        <p><strong>Location:</strong> " . $data['location'] . "</p>
                        <p><strong>Booking ID:</strong> " . $bookingId . "</p>
                    </div>
                    
                    <p>Add this event ticket to your Google Wallet for easy access:</p>
                    <a href='" . $walletUrl . "'>Add to Google Wallet</a>
                    
                    <p>We look forward to seeing you at the event!</p>
                    <p>Best regards,<br>The DutyDinar Team</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        return sendEmail($data['email'], $subject, $body);
    } catch (Exception $e) {
        error_log("Error in sendBookingConfirmationEmail: " . $e->getMessage());
        return ['success' => false, 'message' => 'Error sending email: ' . $e->getMessage()];
    }
}

try {
    // Mock user ID for testing without login
    if (!isset($_SESSION['userId'])) {
        $_SESSION['userId'] = 1; // Testing only
    }
    
    $user = check_authentication();
    $user_id = $user['id'];

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
    
    // Generate Google Wallet pass 
    $wallet_result = createGoogleWalletPass($event_id, $user_id, $booking_id);
    
    // Try to send confirmation email
    $email_sent = false;
    try {
        if ($wallet_result['success']) {
            $email_result = sendBookingConfirmationEmail($user_id, $event_id, $booking_id, $wallet_result['wallet_url']);
            $email_sent = !empty($email_result['success']);
        }
    } catch (Exception $emailError) {
        error_log("Email sending failed: " . $emailError->getMessage());
    }
    
    // Send the response
    echo json_encode([
        'success' => true, 
        'message' => 'Event booked successfully.', 
        'order_id' => $order_id,
        'booking_id' => $booking_id,
        'wallet_url' => $wallet_result['wallet_url'] ?? null,
        'email_sent' => $email_sent
    ]);

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
?>
