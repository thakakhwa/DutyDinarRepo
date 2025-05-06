<?php
// this file handles cors which lets frontend website talk to backend api
// cors (cross origin resource sharing) is a security feature in browsers

// here we make list of websites that are allowed to use our api
// we only want our own websites to use our api, not random other sites
$allowed_origins = [
    "http://localhost:3000", // react development server
    "http://localhost",      // local server
    // Add additional origins as needed
];

// Set CORS headers - these special headers tell browser it's ok for our website to use this api
if (isset($_SERVER['HTTP_ORIGIN'])) {
    // check if the website trying to use our api is in our allowed list
    if (in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
        // if it's allowed, set the header to match that exact website
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
    } else {
        // if not in list, use default (react dev server)
        // this is safer than allowing any website to use our api
        header("Access-Control-Allow-Origin: http://localhost:3000");
    }
}

// here we allow different types of requests (GET, POST etc)
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
// allow these types of headers in requests
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Cache-Control");
// allow cookies and login sessions to work between frontend and api
header("Access-Control-Allow-Credentials: true");

// Handle OPTIONS requests (preflight)
// browsers send these before real requests to check if api allows them
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // just say OK to all preflight requests
    header("HTTP/1.1 200 OK");
    exit(); // stop processing
}
?> 