<?php
// List of allowed origins
$allowed_origins = [
    "http://localhost:3000",
    "http://localhost",
    // Add additional origins as needed
];

// Set CORS headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    // Check if the origin is in our allowed list
    if (in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
    } else {
        // Default allowed origin
        header("Access-Control-Allow-Origin: http://localhost:3000");
    }
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Cache-Control");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}
?> 