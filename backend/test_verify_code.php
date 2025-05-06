<?php
// Set error reporting to maximum level for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Verification Code Test</h1>";

try {
    // Include database connection
    require_once __DIR__ . "/controller/connection.php";
    
    echo "<p>Database connection successful</p>";
    
    // Check if the reset code table exists
    $tableCheckResult = $conn->query("SHOW TABLES LIKE 'password_reset_codes'");
    if ($tableCheckResult->num_rows === 0) {
        echo "<p>Error: password_reset_codes table does not exist!</p>";
        exit;
    }
    
    echo "<p>Table 'password_reset_codes' exists</p>";
    
    // Get the most recent code for testing
    $stmt = $conn->prepare("SELECT * FROM password_reset_codes ORDER BY created_at DESC LIMIT 1");
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo "<p>No password reset codes found in the database</p>";
        exit;
    }
    
    $resetCode = $result->fetch_assoc();
    
    echo "<h2>Latest Reset Code</h2>";
    echo "<table border='1'>";
    echo "<tr><th>ID</th><th>User ID</th><th>Email</th><th>Reset Code</th><th>Expires At</th><th>Status</th></tr>";
    
    $isExpired = strtotime($resetCode['expires_at']) < time();
    $status = $isExpired ? 'Expired' : 'Valid';
    
    echo "<tr>";
    echo "<td>" . $resetCode['id'] . "</td>";
    echo "<td>" . $resetCode['user_id'] . "</td>";
    echo "<td>" . $resetCode['email'] . "</td>";
    echo "<td>" . $resetCode['reset_code'] . "</td>";
    echo "<td>" . $resetCode['expires_at'] . "</td>";
    echo "<td>" . $status . "</td>";
    echo "</tr>";
    echo "</table>";
    
    // Current time
    echo "<p>Current server time: " . date('Y-m-d H:i:s') . "</p>";
    echo "<p>Current UTC time: " . gmdate('Y-m-d H:i:s') . "</p>";
    
    echo "<h2>Verification Test</h2>";
    
    $email = $resetCode['email'];
    $codeInDb = $resetCode['reset_code'];
    
    echo "<form method='post'>";
    echo "<p><strong>Email:</strong> " . $email . "</p>";
    echo "<p><strong>Code in Database:</strong> " . $codeInDb . "</p>";
    
    echo "<p><label for='test_code'>Enter code to test:</label>";
    echo "<input type='text' id='test_code' name='test_code' value='" . (isset($_POST['test_code']) ? htmlspecialchars($_POST['test_code']) : $codeInDb) . "'></p>";
    
    echo "<p><input type='submit' value='Test Verification Logic'></p>";
    echo "</form>";
    
    // If form submitted, test the verification logic
    if (isset($_POST['test_code'])) {
        $testCode = $_POST['test_code'];
        $normalizedTestCode = ltrim($testCode, '0'); // Remove leading zeros
        
        echo "<h3>Test Results</h3>";
        echo "<p>Code you entered: <strong>" . htmlspecialchars($testCode) . "</strong></p>";
        echo "<p>Normalized code (leading zeros removed): <strong>" . $normalizedTestCode . "</strong></p>";
        
        // Test different combinations
        echo "<table border='1'>";
        echo "<tr><th>Comparison Type</th><th>SQL Query</th><th>Result</th></tr>";
        
        // Test 1: Exact match
        $exactMatchQuery = "SELECT * FROM password_reset_codes WHERE email = '$email' AND reset_code = '$testCode' AND expires_at > NOW()";
        $exactMatchResult = $conn->query($exactMatchQuery);
        echo "<tr>";
        echo "<td>Exact Match</td>";
        echo "<td>" . htmlspecialchars($exactMatchQuery) . "</td>";
        echo "<td>" . ($exactMatchResult->num_rows > 0 ? "SUCCESS" : "FAIL") . "</td>";
        echo "</tr>";
        
        // Test 2: Normalized match
        $normalizedMatchQuery = "SELECT * FROM password_reset_codes WHERE email = '$email' AND reset_code = '$normalizedTestCode' AND expires_at > NOW()";
        $normalizedMatchResult = $conn->query($normalizedMatchQuery);
        echo "<tr>";
        echo "<td>Normalized Match</td>";
        echo "<td>" . htmlspecialchars($normalizedMatchQuery) . "</td>";
        echo "<td>" . ($normalizedMatchResult->num_rows > 0 ? "SUCCESS" : "FAIL") . "</td>";
        echo "</tr>";
        
        // Test 3: Either match (the approach used in our fixed code)
        $eitherMatchQuery = "SELECT * FROM password_reset_codes WHERE email = '$email' AND (reset_code = '$testCode' OR reset_code = LPAD('$normalizedTestCode', 6, '0')) AND expires_at > NOW()";
        $eitherMatchResult = $conn->query($eitherMatchQuery);
        echo "<tr>";
        echo "<td>Either Match</td>";
        echo "<td>" . htmlspecialchars($eitherMatchQuery) . "</td>";
        echo "<td>" . ($eitherMatchResult->num_rows > 0 ? "SUCCESS" : "FAIL") . "</td>";
        echo "</tr>";
        
        // Test 4: Ignore expiration
        $ignoreExpirationQuery = "SELECT * FROM password_reset_codes WHERE email = '$email' AND (reset_code = '$testCode' OR reset_code = LPAD('$normalizedTestCode', 6, '0'))";
        $ignoreExpirationResult = $conn->query($ignoreExpirationQuery);
        echo "<tr>";
        echo "<td>Ignore Expiration</td>";
        echo "<td>" . htmlspecialchars($ignoreExpirationQuery) . "</td>";
        echo "<td>" . ($ignoreExpirationResult->num_rows > 0 ? "SUCCESS" : "FAIL") . "</td>";
        echo "</tr>";
        
        echo "</table>";
        
        // Check expiration specifically
        $expirationCheckQuery = "SELECT * FROM password_reset_codes WHERE email = '$email' AND expires_at > NOW()";
        $expirationCheckResult = $conn->query($expirationCheckQuery);
        
        echo "<h3>Expiration Check</h3>";
        echo "<p>Query: " . htmlspecialchars($expirationCheckQuery) . "</p>";
        if ($expirationCheckResult->num_rows > 0) {
            echo "<p style='color:green;'>Code is NOT expired according to database check.</p>";
        } else {
            echo "<p style='color:red;'>Code IS expired according to database check.</p>";
            
            // Get the actual expiration time and compare with current time
            $expCheckDetailQuery = "SELECT expires_at FROM password_reset_codes WHERE email = '$email'";
            $expCheckDetailResult = $conn->query($expCheckDetailQuery);
            if ($expCheckDetailResult->num_rows > 0) {
                $expRow = $expCheckDetailResult->fetch_assoc();
                $expiryTime = $expRow['expires_at'];
                $currentTime = date('Y-m-d H:i:s');
                $currentUtcTime = gmdate('Y-m-d H:i:s');
                
                echo "<p>Expiry time in DB: <strong>$expiryTime</strong></p>";
                echo "<p>Current local server time: <strong>$currentTime</strong></p>";
                echo "<p>Current UTC time: <strong>$currentUtcTime</strong></p>";
                
                // Calculate the difference
                $expTimestamp = strtotime($expiryTime);
                $currentTimestamp = time();
                $diffInSeconds = $expTimestamp - $currentTimestamp;
                
                if ($diffInSeconds < 0) {
                    echo "<p>Code expired " . abs($diffInSeconds) . " seconds ago.</p>";
                } else {
                    echo "<p>Code will expire in " . $diffInSeconds . " seconds.</p>";
                }
            }
        }
    }
    
} catch (Exception $e) {
    echo "<p>Error: " . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
?> 