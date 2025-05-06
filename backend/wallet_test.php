<?php
// Test script to verify Google Wallet URL generation
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include the book_event.php file to access the createGoogleWalletPass function
require_once 'api/book_event.php';

// Test parameters
$event_id = 1;
$user_id = 1;
$booking_id = time(); // Use current timestamp as a unique booking ID

// Generate a Google Wallet URL
$wallet_result = createGoogleWalletPass($event_id, $user_id, $booking_id);

// Display the result
echo "<h1>Google Wallet URL Test</h1>";

echo "<h2>Wallet URL Generation Result:</h2>";
echo "<pre>";
print_r($wallet_result);
echo "</pre>";

// Display a clickable link
echo "<h2>Test the Generated URL:</h2>";
if ($wallet_result['success']) {
    echo "<p>Click the following link to test the Google Wallet URL:</p>";
    echo "<a href='" . htmlspecialchars($wallet_result['wallet_url'], ENT_QUOTES, 'UTF-8') . "' target='_blank' style='display: inline-block; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;'>Add to Google Wallet</a>";
    
    // Also display the plain URL
    echo "<p style='margin-top: 20px;'>Plain URL (you can copy and paste this):</p>";
    echo "<input type='text' value='" . htmlspecialchars($wallet_result['wallet_url'], ENT_QUOTES, 'UTF-8') . "' style='width: 100%; padding: 10px; font-family: monospace;' onclick='this.select()'>";
    
    // Generate and display QR code
    echo "<h2>Test QR Code:</h2>";
    echo "<p>Scan this QR code with your mobile device:</p>";
    echo "<img src='https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" . urlencode($wallet_result['wallet_url']) . "' width='200' height='200' style='border: 1px solid #ddd;'>";
} else {
    echo "<p style='color: red;'>Failed to generate Google Wallet URL.</p>";
}

// Display debugging tips
echo "<h2>Debugging Tips:</h2>";
echo "<ul>";
echo "<li>The URL should start with <code>https://wallet.google/save/eventticket/</code></li>";
echo "<li>If clicking the link doesn't work, try opening it on a mobile device with Google Wallet installed</li>";
echo "<li>Make sure you're signed into a Google account that has Google Wallet set up</li>";
echo "<li>Check the browser console for any errors</li>";
echo "</ul>";

// Add a button to reload the test with a new booking ID
echo "<form method='GET'>";
echo "<button type='submit' style='margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;'>Generate New Test URL</button>";
echo "</form>";
?> 