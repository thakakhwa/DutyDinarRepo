<?php
require_once 'session_config.php';
require_once 'config.php'; // Database connection

// Set CORS headers first
set_session_cors_headers();

// Configure and start session
configure_session();

header('Content-Type: application/json');

// Function to generate session token
function generateSessionToken($email) {
    // Create a unique session token using the email and some random data
    return hash('sha256', $email . microtime(true) . rand());
}

// Function to set session token and user data
function setSessionToken($email) {
    global $conn;

    // Generate a session token
    $session_token = generateSessionToken($email);

    // Regenerate session ID to prevent fixation attacks
    session_regenerate_id(true);
    
    // Store the session token in the PHP session
    $_SESSION['session_token'] = $session_token;

    // Retrieve user details based on the email
    $stmt = $conn->prepare("SELECT id, userType FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->bind_result($userId, $userType);
    $stmt->fetch();
    $stmt->close();

    if ($userId) {
        // Store the user data in the PHP session
        $_SESSION['user'] = [
            'id' => $userId,
            'email' => $email,
            'userType' => $userType
        ];
    } else {
        return false; // If no user found for the email
    }

    // Return the session token, user ID, and user type
    return [
        'session_token' => $session_token,
        'user_id' => $userId,
        'user_type' => $userType
    ];
}

// Check if email is provided in the request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['email'])) {
        $email = $data['email'];

        // Optional: Validate the email if needed
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Invalid email format']);
            exit;
        }

        // Set the session token and retrieve the user data
        $result = setSessionToken($email);

        if ($result) {
            // Return the success response with the session token and user data
            echo json_encode([
                'success' => true,
                'message' => 'Session token and user data set successfully',
                'data' => [
                    'session_token' => $result['session_token'],
                    'user_id' => $result['user_id'],
                    'user_type' => $result['user_type']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'User not found for this email']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Email is required']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>