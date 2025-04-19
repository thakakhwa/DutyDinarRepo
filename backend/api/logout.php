<?php
require_once 'config.php';
require_once 'cors.php';

session_start();
header('Content-Type: application/json');

try {
    // Clear all session data
    $_SESSION = array();

    // Destroy the session cookie
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }

    // Destroy the session
    session_destroy();

    echo json_encode([
        'status' => true,
        'message' => 'Logged out successfully.'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => false,
        'message' => 'Error during logout: ' . $e->getMessage()
    ]);
}
?>
