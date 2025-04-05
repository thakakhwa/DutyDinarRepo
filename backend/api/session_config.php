<?php
// session_config.php - Include this at the top of all session-related files

// Configure session parameters for local XAMPP development
function configure_session() {
    // Only set cookie params if session hasn't started yet
    if (session_status() === PHP_SESSION_NONE) {
        // Set session cookie parameters for local development
        $lifetime = 3600; // 1 hour
        $path = '/';
        $domain = ''; // Empty for localhost
        $secure = false; // False for HTTP on localhost
        $httponly = true;
        
        // Set cookie parameters
        session_set_cookie_params($lifetime, $path, $domain, $secure, $httponly);
        
        // Start the session
        session_start();
    }
}

// Set CORS headers for local development
function set_local_cors_headers() {
    // For local development, allow localhost with any port
    header("Access-Control-Allow-Origin: http://localhost:3000");
    // This is crucial - it allows cookies to be sent with the request
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    
    // Handle preflight OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}
?>