<?php
require_once 'config.php';
require_once 'cors.php';

session_start();
header('Content-Type: application/json');

try {
    // Enable detailed error reporting
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    
    $input = json_decode(file_get_contents("php://input"), true);
    error_log("Login attempt with input: " . print_r($input, true));

    if (empty($input['email']) || empty($input['password'])) {
        throw new Exception('Email and password are required', 400);
    }

    // Verify database connection
    if (!$conn) {
        throw new Exception('Database connection failed: ' . ($conn->connect_error ?? 'Unknown error'), 500);
    }

    $stmt = $conn->prepare("SELECT id, password, userType FROM users WHERE email = ?");
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error, 500);
    }
    
    if (!$stmt->bind_param("s", $input['email'])) {
        throw new Exception('Bind param failed: ' . $stmt->error, 500);
    }
    
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error, 500);
    }
    
    $result = $stmt->get_result();
    if (!$result) {
        throw new Exception('Get result failed: ' . $stmt->error, 500);
    }

    if ($result->num_rows === 0) {
        throw new Exception('Invalid email or password', 401);
    }

    $user = $result->fetch_assoc();

    if (!password_verify($input['password'], $user['password'])) {
        throw new Exception('Invalid email or password', 401);
    }

    $sessionData = [
        'username' => $input['email'],
        'userType' => $user['userType'],
        'userId'   => $user['id']
    ];

    // Set session directly
    $_SESSION['userId'] = $user['id'];
    $_SESSION['userType'] = $user['userType'];
    $_SESSION['username'] = $input['email'];
    
    // Set secure session cookie with proper parameters
    $cookieParams = session_get_cookie_params();
    $expires = time() + $cookieParams['lifetime'];
    setcookie(
        session_name(),
        session_id(),
        [
            'expires' => $expires,
            'path' => '/',
<<<<<<< HEAD
            'domain' => $cookieParams['domain'],
            'secure' => $cookieParams['secure'],
            'httponly' => $cookieParams['httponly'],
            'samesite' => 'Lax'
=======
            'domain' => null,
            'secure' => false, // Force false for local dev to allow cookie over HTTP
            'httponly' => $cookieParams['httponly'],
            'samesite' => 'None',
>>>>>>> fixedbranchfsfs
        ]
    );
    
    error_log("Session created for user: " . $user['id']); // Log successful session creation

    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'data' => $sessionData,
        'userType' => $user['userType'] // Explicitly include userType
    ]);

} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'status' => false,
        'message' => $e->getMessage()
    ]);
}
