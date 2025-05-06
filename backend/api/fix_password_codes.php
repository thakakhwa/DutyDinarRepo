<?php
// Set error reporting to maximum level for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// This is a standalone CORS handler that doesn't load any dependencies 
// and just handles the preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    require_once 'cors_handler.php';
    exit;
}

// For normal requests, we can use the full flow
require_once 'config.php';
require_once 'cors.php';

// Set CORS headers explicitly again for the main request
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

echo "<h1>Fix Password Reset Codes</h1>";

try {
    // Get all existing reset codes
    $stmt = $conn->prepare("SELECT * FROM password_reset_codes");
    $stmt->execute();
    $result = $stmt->get_result();
    
    echo "<h2>Found " . $result->num_rows . " reset codes in database</h2>";
    
    if ($result->num_rows > 0) {
        echo "<table border='1'>";
        echo "<tr><th>ID</th><th>Email</th><th>Reset Code</th><th>Old Expires At</th><th>New Expires At</th><th>Action</th></tr>";
        
        while ($row = $result->fetch_assoc()) {
            // Calculate a new expiration time (30 minutes from now)
            $newExpiresAt = date('Y-m-d H:i:s', time() + (30 * 60));
            
            // Update the expiration time
            $updateStmt = $conn->prepare("UPDATE password_reset_codes SET expires_at = ? WHERE id = ?");
            $updateStmt->bind_param("si", $newExpiresAt, $row['id']);
            $updateStmt->execute();
            
            // Show the update result
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . $row['email'] . "</td>";
            echo "<td>" . $row['reset_code'] . "</td>";
            echo "<td>" . $row['expires_at'] . "</td>";
            echo "<td>" . $newExpiresAt . "</td>";
            echo "<td>" . ($updateStmt->affected_rows > 0 ? "Updated" : "No Change") . "</td>";
            echo "</tr>";
            
            $updateStmt->close();
        }
        
        echo "</table>";
        
        // Verify the updates
        $verifyStmt = $conn->prepare("SELECT * FROM password_reset_codes");
        $verifyStmt->execute();
        $verifyResult = $verifyStmt->get_result();
        
        echo "<h2>Verification after update</h2>";
        
        echo "<table border='1'>";
        echo "<tr><th>ID</th><th>Email</th><th>Reset Code</th><th>Expires At</th><th>Status</th></tr>";
        
        while ($row = $verifyResult->fetch_assoc()) {
            $isExpired = strtotime($row['expires_at']) < time();
            $status = $isExpired ? 'Expired' : 'Valid';
            
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . $row['email'] . "</td>";
            echo "<td>" . $row['reset_code'] . "</td>";
            echo "<td>" . $row['expires_at'] . "</td>";
            echo "<td>" . $status . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
        
        $verifyStmt->close();
    }
    
    // Return server time information
    echo "<h3>Server Time Information</h3>";
    echo "<p>Server timezone: " . date_default_timezone_get() . "</p>";
    echo "<p>Current server time: " . date('Y-m-d H:i:s') . "</p>";
    echo "<p>Current UTC time: " . gmdate('Y-m-d H:i:s') . "</p>";
    
    // Return success
    $response = [
        'success' => true,
        'message' => 'All password reset codes have been updated with new expiration times.',
        'codes_updated' => $result->num_rows
    ];
    
    // Output JSON response at the end
    echo "<script>console.log(" . json_encode($response) . ");</script>";
    
} catch (Exception $e) {
    // Display the error
    echo "<h2>Error</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
    
    // Return error
    $response = [
        'success' => false,
        'message' => 'An error occurred: ' . $e->getMessage()
    ];
    
    // Output JSON response at the end
    echo "<script>console.log(" . json_encode($response) . ");</script>";
}
?> 