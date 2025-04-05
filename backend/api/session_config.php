<?php
// session_config.php - Include this file at the top of your session-related files

// Configure session parameters for better security and cross-domain functionality
function configure_session() {
    // Only set cookie params if session hasn't started yet
    if (session_status() === PHP_SESSION_NONE) {
        // Set session cookie parameters
        $lifetime = 3600; // 1 hour
        $path = '/';
        $domain = ''; // Current domain
        $secure = false; // Set to true if using HTTPS
        $httponly = true;
        
        // For PHP 7.3 and above, we can set SameSite attribute
        if (PHP_VERSION_ID >= 70300) {
            session_set_cookie_params([
                'lifetime' => $lifetime,
                'path' => $path,
                'domain' => $domain,
                'secure' => $secure,
                'httponly' => $httponly,
                'samesite' => 'Lax' // Options: None, Lax, Strict
            ]);
        } else {
            session_set_cookie_params($lifetime, $path, $domain, $secure, $httponly);
        }
        
        // Start the session
        session_start();
    }
}

// Set consistent CORS headers for cross-domain requests
function set_session_cors_headers() {
    // Specify the exact origin that's allowed to access
    header("Access-Control-Allow-Origin: http://localhost:3000");
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