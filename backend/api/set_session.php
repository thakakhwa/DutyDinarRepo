<?php
session_start();

// Assuming user credentials are sent via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    error_log("Received session data: " . print_r($_POST, true)); // Log received session data
    $username = $_POST['username'] ?? ''; 
    $userType = $_POST['userType'] ?? '';

    // Validate user credentials (this should be replaced with actual validation logic)
    if (!empty($username) && !empty($userType)) {
        $_SESSION['username'] = $username;
        $_SESSION['userType'] = $userType;
        
        // Set secure session cookie
        $cookieParams = session_get_cookie_params();
        setcookie(
            session_name(),
            session_id(),
            [
                'lifetime' => $cookieParams['lifetime'],
                'path' => '/',
                'domain' => $cookieParams['domain'],
                'secure' => true,
                'httponly' => true,
                'samesite' => 'None'
            ]
        );
        
        echo json_encode([
            'status' => true, 
            'message' => 'Session set successfully.',
            'sessionId' => session_id()
        ]);
    } else {
        echo json_encode(['status' => false, 'message' => 'Invalid credentials.']);
    }
} else {
    echo json_encode(['status' => false, 'message' => 'Invalid request method.']);
}
?>
