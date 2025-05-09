<?php
/**
 * Pass Download API Endpoint
 * 
 * This script handles requests to download wallet passes
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/pass_download.log');

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if the request is a GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Check if the pass ID and type are provided
if (!isset($_GET['id']) || !isset($_GET['type'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required parameters']);
    exit;
}

$passId = $_GET['id'];
$passType = $_GET['type'];

// Validate pass type
if ($passType !== 'apple' && $passType !== 'google') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid pass type']);
    exit;
}

// In a real implementation, this would:
// 1. Look up the pass details in a database
// 2. Generate or retrieve the actual pass file
// 3. Serve it with the correct headers or redirect to the appropriate service

try {
    // Check if this is a mock pass that has stored details
    $passDetailsFile = __DIR__ . '/generated_passes/' . $passId . '.json';
    if (file_exists($passDetailsFile)) {
        $passDetails = json_decode(file_get_contents($passDetailsFile), true);
        error_log("Retrieved pass details for {$passId}");
    } else {
        error_log("Pass details not found for {$passId}");
        // We'll still proceed with a demo pass for this example
    }
    
    // Handle Apple Wallet passes
    if ($passType === 'apple') {
        // For demo purposes, we'll redirect to the Apple Wallet pass installation URL
        // The actual Apple Wallet pass.com URL pattern looks like:
        // wallet://add?pass=https://example.com/path/to/pass.pkpass
        
        // For demonstration purposes, we'll create a redirect that launches the
        // Apple Wallet app if the user is on iOS
        $demoPassUrl = 'http://localhost/DutyDinarRepo/backend/api/wallet/mock_passes/example.pkpass';
        
        // Create Apple Wallet intent URL
        $appleWalletUrl = 'wallet://add?pass=' . urlencode($demoPassUrl);
        
        // Log what we're doing
        error_log("Redirecting to Apple Wallet URL: {$appleWalletUrl}");
        
        // Redirect to the Apple Wallet URL
        // Note: This only works on iOS devices with the Wallet app installed
        header('Location: ' . $appleWalletUrl);
        exit;
    }
    
    // Handle Google Wallet passes
    if ($passType === 'google') {
        // For Google Wallet, we'll use their standard save URL
        $objectId = isset($passDetails['object_id']) ? $passDetails['object_id'] : 'booking_' . time();
        
        // Create a Google Wallet save URL
        $googleWalletUrl = 'https://wallet.google/save/eventticket/?et=' . $objectId;
        
        // Log what we're doing
        error_log("Redirecting to Google Wallet URL: {$googleWalletUrl}");
        
        // Redirect to the Google Wallet URL
        header('Location: ' . $googleWalletUrl);
        exit;
    }
    
} catch (Exception $e) {
    error_log("Error generating pass download: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to generate pass']);
    exit;
}
?> 