<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$upload_dir = __DIR__ . '/../uploads';
$test_file = $upload_dir . '/test_' . time() . '.txt';

echo "Upload directory: " . $upload_dir . "<br>";
echo "Test file path: " . $test_file . "<br>";

// Check if directory exists
if (!is_dir($upload_dir)) {
    echo "Directory doesn't exist!<br>";
    
    // Try to create it
    if (mkdir($upload_dir, 0777, true)) {
        echo "Created directory successfully.<br>";
    } else {
        echo "Failed to create directory!<br>";
        echo "Error: " . error_get_last()['message'] . "<br>";
    }
} else {
    echo "Directory exists.<br>";
    
    // Check permissions
    echo "Directory permissions: " . substr(sprintf('%o', fileperms($upload_dir)), -4) . "<br>";
    echo "Is writable: " . (is_writable($upload_dir) ? "Yes" : "No") . "<br>";
}

// Try to write a test file
try {
    if (file_put_contents($test_file, "Test content")) {
        echo "Successfully wrote test file.<br>";
        
        // Try to read it back
        $content = file_get_contents($test_file);
        echo "Read content: " . $content . "<br>";
        
        // Clean up
        if (unlink($test_file)) {
            echo "Successfully deleted test file.<br>";
        } else {
            echo "Failed to delete test file.<br>";
        }
    } else {
        echo "Failed to write test file!<br>";
        echo "Error: " . error_get_last()['message'] . "<br>";
    }
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "<br>";
}
?> 