<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database configuration
require_once 'api/config.php';

// Function to display styled message
function display_message($success, $message) {
    $color = $success ? 'green' : 'red';
    echo "<div style='padding: 10px; margin: 10px 0; background-color: " . ($success ? '#dff0d8' : '#f2dede') . "; 
                       border: 1px solid " . ($success ? '#d6e9c6' : '#ebccd1') . "; 
                       color: " . ($success ? '#3c763d' : '#a94442') . "; border-radius: 4px;'>" . 
         $message . 
         "</div>";
}

// Function to check if the password_reset_codes table exists
function check_reset_codes_table($conn) {
    $sql = "SHOW TABLES LIKE 'password_reset_codes'";
    $result = $conn->query($sql);
    return $result->num_rows > 0;
}

// Function to check the structure of the table
function check_table_structure($conn) {
    $sql = "DESCRIBE password_reset_codes";
    $result = $conn->query($sql);
    
    if ($result === false) {
        return ['success' => false, 'message' => 'Failed to describe table: ' . $conn->error];
    }
    
    $columns = [];
    while ($row = $result->fetch_assoc()) {
        $columns[$row['Field']] = $row;
    }
    
    // Check if all required columns exist
    $requiredColumns = ['id', 'user_id', 'email', 'reset_code', 'reset_token', 'expires_at', 'created_at'];
    $missingColumns = [];
    
    foreach ($requiredColumns as $column) {
        if (!isset($columns[$column])) {
            $missingColumns[] = $column;
        }
    }
    
    if (!empty($missingColumns)) {
        return [
            'success' => false, 
            'message' => 'Missing columns: ' . implode(', ', $missingColumns)
        ];
    }
    
    return ['success' => true, 'message' => 'Table structure is correct'];
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Flow Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2 {
            color: #333;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .test-result {
            margin: 15px 0;
            padding: 10px;
            border-radius: 5px;
        }
        .success {
            background-color: #dff0d8;
            border: 1px solid #d6e9c6;
            color: #3c763d;
        }
        .error {
            background-color: #f2dede;
            border: 1px solid #ebccd1;
            color: #a94442;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        table, th, td {
            border: 1px solid #ddd;
        }
        th, td {
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
        }
        pre {
            background-color: #f5f5f5;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: auto;
        }
        form {
            margin-top: 20px;
        }
        input, button {
            padding: 8px;
            margin: 5px 0;
        }
        button {
            background-color: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
            border-radius: 4px;
        }
        button:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <h1>Password Reset Flow Test</h1>
    
    <div class="section">
        <h2>1. Database Table Check</h2>
        <?php
        $tableExists = check_reset_codes_table($conn);
        if ($tableExists) {
            display_message(true, "✅ The password_reset_codes table exists.");
            
            // Check the table structure
            $structureCheck = check_table_structure($conn);
            display_message($structureCheck['success'], 
                            $structureCheck['success'] ? 
                            "✅ " . $structureCheck['message'] : 
                            "❌ " . $structureCheck['message']);
            
            // Show table contents
            $resetCodes = $conn->query("SELECT * FROM password_reset_codes ORDER BY created_at DESC LIMIT 10");
            if ($resetCodes && $resetCodes->num_rows > 0) {
                echo "<h3>Recent Reset Codes:</h3>";
                echo "<table>";
                echo "<tr><th>ID</th><th>User ID</th><th>Email</th><th>Code</th><th>Token</th><th>Expires At</th><th>Created At</th></tr>";
                
                while ($row = $resetCodes->fetch_assoc()) {
                    echo "<tr>";
                    echo "<td>" . htmlspecialchars($row['id']) . "</td>";
                    echo "<td>" . htmlspecialchars($row['user_id']) . "</td>";
                    echo "<td>" . htmlspecialchars($row['email']) . "</td>";
                    echo "<td>" . htmlspecialchars($row['reset_code']) . "</td>";
                    echo "<td>" . (isset($row['reset_token']) ? substr(htmlspecialchars($row['reset_token']), 0, 10) . "..." : "NULL") . "</td>";
                    echo "<td>" . htmlspecialchars($row['expires_at']) . "</td>";
                    echo "<td>" . htmlspecialchars($row['created_at']) . "</td>";
                    echo "</tr>";
                }
                
                echo "</table>";
            } else {
                display_message(false, "No reset codes found in the database.");
            }
        } else {
            display_message(false, "❌ The password_reset_codes table does not exist. Please create it using the forgot_password.php endpoint.");
        }
        ?>
    </div>
    
    <div class="section">
        <h2>2. Password Reset API Endpoints</h2>
        <p>Use these forms to test each step of the password reset flow:</p>
        
        <h3>Step 1: Request Reset Code</h3>
        <form id="requestResetForm" action="api/forgot_password.php" method="post">
            <div>
                <label for="email">Email address:</label>
                <input type="email" id="email" name="email" required>
            </div>
            <button type="button" id="requestResetBtn">Request Reset Code</button>
            <div id="requestResetResult"></div>
        </form>
        
        <h3>Step 2: Verify Reset Code</h3>
        <form id="verifyCodeForm" action="api/verify_reset_code.php" method="post">
            <div>
                <label for="verifyEmail">Email address:</label>
                <input type="email" id="verifyEmail" name="email" required>
            </div>
            <div>
                <label for="code">Verification code:</label>
                <input type="text" id="code" name="code" required pattern="[0-9]{6}" maxlength="6">
            </div>
            <button type="button" id="verifyCodeBtn">Verify Code</button>
            <div id="verifyCodeResult"></div>
        </form>
        
        <h3>Step 3: Reset Password</h3>
        <form id="resetPasswordForm" action="api/reset_password.php" method="post">
            <div>
                <label for="userId">User ID:</label>
                <input type="number" id="userId" name="user_id" required>
            </div>
            <div>
                <label for="resetToken">Reset Token:</label>
                <input type="text" id="resetToken" name="reset_token" required>
            </div>
            <div>
                <label for="newPassword">New Password:</label>
                <input type="password" id="newPassword" name="new_password" required minlength="8">
            </div>
            <div>
                <label for="confirmPassword">Confirm Password:</label>
                <input type="password" id="confirmPassword" name="confirm_password" required minlength="8">
            </div>
            <button type="button" id="resetPasswordBtn">Reset Password</button>
            <div id="resetPasswordResult"></div>
        </form>
    </div>
    
    <script>
        // Helper function to make API requests
        async function makeRequest(url, data) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                return await response.json();
            } catch (error) {
                return {
                    success: false,
                    message: 'Request failed: ' + error.message
                };
            }
        }
        
        // Function to display result
        function displayResult(elementId, result, isSuccess) {
            const element = document.getElementById(elementId);
            element.className = isSuccess ? 'test-result success' : 'test-result error';
            element.innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
            
            // If verification was successful, populate the next form
            if (isSuccess && elementId === 'verifyCodeResult' && result.data) {
                document.getElementById('userId').value = result.data.user_id || '';
                document.getElementById('resetToken').value = result.data.reset_token || '';
            }
        }
        
        // Event listeners for all three forms
        document.getElementById('requestResetBtn').addEventListener('click', async () => {
            const email = document.getElementById('email').value;
            const result = await makeRequest('api/forgot_password.php', { email });
            displayResult('requestResetResult', result, result.success);
            
            // Auto-fill the email in the next form
            document.getElementById('verifyEmail').value = email;
        });
        
        document.getElementById('verifyCodeBtn').addEventListener('click', async () => {
            const email = document.getElementById('verifyEmail').value;
            const code = document.getElementById('code').value;
            const result = await makeRequest('api/verify_reset_code.php', { email, code });
            displayResult('verifyCodeResult', result, result.success);
        });
        
        document.getElementById('resetPasswordBtn').addEventListener('click', async () => {
            const userId = document.getElementById('userId').value;
            const resetToken = document.getElementById('resetToken').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                displayResult('resetPasswordResult', {
                    success: false,
                    message: 'Passwords do not match!'
                }, false);
                return;
            }
            
            const result = await makeRequest('api/reset_password.php', {
                user_id: userId,
                reset_token: resetToken,
                new_password: newPassword,
                confirm_password: confirmPassword
            });
            
            displayResult('resetPasswordResult', result, result.success);
        });
    </script>
</body>
</html> 