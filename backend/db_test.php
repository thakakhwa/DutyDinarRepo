<?php
// Set error reporting to maximum level for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Direct Database Test - Password Reset Codes</h1>";

try {
    // Include the connection file directly
    require_once __DIR__ . "/controller/connection.php";
    
    if (!isset($conn)) {
        throw new Exception("Database connection not established!");
    }
    
    echo "<p>Database connection successful</p>";
    
    // Check if the table exists
    $tableCheckResult = $conn->query("SHOW TABLES LIKE 'password_reset_codes'");
    if ($tableCheckResult->num_rows === 0) {
        echo "<p>Error: password_reset_codes table does not exist!</p>";
        exit;
    }
    
    echo "<p>Table 'password_reset_codes' exists</p>";
    
    // Get all codes
    $stmt = $conn->prepare("SELECT * FROM password_reset_codes ORDER BY created_at DESC");
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo "<p>No password reset codes found in the database</p>";
    } else {
        echo "<p>Found " . $result->num_rows . " password reset codes:</p>";
        echo "<table border='1'>";
        echo "<tr><th>ID</th><th>User ID</th><th>Email</th><th>Reset Code</th><th>Reset Token</th><th>Expires At</th><th>Created At</th><th>Status</th></tr>";
        
        while ($row = $result->fetch_assoc()) {
            $isExpired = strtotime($row['expires_at']) < time();
            $status = $isExpired ? 'Expired' : 'Valid';
            
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . $row['user_id'] . "</td>";
            echo "<td>" . $row['email'] . "</td>";
            echo "<td>" . $row['reset_code'] . "</td>";
            echo "<td>" . ($row['reset_token'] ? 'Set' : 'Not Set') . "</td>";
            echo "<td>" . $row['expires_at'] . "</td>";
            echo "<td>" . $row['created_at'] . "</td>";
            echo "<td>" . $status . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
    }
    
    // Get current server time
    echo "<p>Current server time: " . date('Y-m-d H:i:s') . "</p>";
    
} catch (Exception $e) {
    echo "<p>Error: " . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
?> 