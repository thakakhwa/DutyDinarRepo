<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/html');

echo "<h1>Image Upload Debug</h1>";

// System information
echo "<h2>System Information</h2>";
echo "<pre>";
echo "PHP Version: " . phpversion() . "\n";
echo "Server User: " . get_current_user() . "\n";
echo "Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "Script Path: " . __FILE__ . "\n";
echo "</pre>";

// Directory paths
$current_dir = __DIR__;
$backend_dir = dirname(__DIR__);
$uploads_dir = $backend_dir . '/uploads';
$test_file = $uploads_dir . '/debug_test_' . time() . '.txt';
$test_image = $uploads_dir . '/debug_test_' . time() . '.png';

echo "<h2>Directory Information</h2>";
echo "<pre>";
echo "Current Directory: $current_dir\n";
echo "Backend Directory: $backend_dir\n";
echo "Uploads Directory: $uploads_dir\n";
echo "</pre>";

// Check uploads directory
echo "<h2>Uploads Directory Check</h2>";
echo "<pre>";
if (!is_dir($uploads_dir)) {
    echo "Uploads directory does not exist!\n";
    echo "Attempting to create directory with full permissions...\n";
    
    if (mkdir($uploads_dir, 0777, true)) {
        echo "Successfully created uploads directory.\n";
        // Set permissions explicitly
        chmod($uploads_dir, 0777);
        echo "Set permissions to 777.\n";
    } else {
        echo "FAILED to create uploads directory!\n";
        echo "Error: " . error_get_last()['message'] . "\n";
    }
} else {
    echo "Uploads directory exists.\n";
    echo "Current permissions: " . substr(sprintf('%o', fileperms($uploads_dir)), -4) . "\n";
    
    // Try to update permissions
    echo "Attempting to update permissions to 777...\n";
    if (chmod($uploads_dir, 0777)) {
        echo "Successfully updated permissions.\n";
    } else {
        echo "FAILED to update permissions.\n";
        echo "Error: " . error_get_last()['message'] . "\n";
    }
    
    echo "Is writable: " . (is_writable($uploads_dir) ? "Yes" : "No") . "\n";
}
echo "</pre>";

// Test file write
echo "<h2>File Write Test</h2>";
echo "<pre>";
try {
    echo "Attempting to write test file: $test_file\n";
    
    if (file_put_contents($test_file, "Test content at " . date('Y-m-d H:i:s'))) {
        echo "SUCCESS: Test file written successfully.\n";
        
        // Check file permissions
        $perms = fileperms($test_file);
        echo "File permissions: " . substr(sprintf('%o', $perms), -4) . "\n";
        
        // Try to read it back
        $content = file_get_contents($test_file);
        echo "Read content: " . $content . "\n";
        
        // Clean up
        if (unlink($test_file)) {
            echo "Test file deleted successfully.\n";
        } else {
            echo "FAILED to delete test file.\n";
            echo "Error: " . error_get_last()['message'] . "\n";
        }
    } else {
        echo "FAILED to write test file!\n";
        echo "Error: " . error_get_last()['message'] . "\n";
    }
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
echo "</pre>";

// Test image creation
echo "<h2>Image Creation Test</h2>";
echo "<pre>";
try {
    echo "Attempting to create a test image: $test_image\n";
    
    // Create a simple image
    $img = imagecreatetruecolor(100, 100);
    $bg = imagecolorallocate($img, 255, 255, 255);
    $text_color = imagecolorallocate($img, 0, 0, 0);
    imagefilledrectangle($img, 0, 0, 99, 99, $bg);
    imagestring($img, 5, 10, 40, 'Test Image', $text_color);
    
    // Save the image
    if (imagepng($img, $test_image)) {
        echo "SUCCESS: Test image created successfully.\n";
        
        // Check file permissions
        $perms = fileperms($test_image);
        echo "Image permissions: " . substr(sprintf('%o', $perms), -4) . "\n";
        
        // Clean up
        if (unlink($test_image)) {
            echo "Test image deleted successfully.\n";
        } else {
            echo "FAILED to delete test image.\n";
            echo "Error: " . error_get_last()['message'] . "\n";
        }
    } else {
        echo "FAILED to create test image!\n";
        echo "Error: " . error_get_last()['message'] . "\n";
    }
    
    imagedestroy($img);
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
echo "</pre>";

// Test base64 image save
echo "<h2>Base64 Image Save Test</h2>";
echo "<pre>";
// A very small base64 encoded PNG image (1x1 pixel)
$base64_image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

try {
    echo "Attempting to save base64 image\n";
    
    // Extract the image data
    $image_data = substr($base64_image, strpos($base64_image, ',') + 1);
    $decoded_data = base64_decode($image_data);
    
    $test_b64_image = $uploads_dir . '/debug_b64_' . time() . '.png';
    
    if (file_put_contents($test_b64_image, $decoded_data)) {
        echo "SUCCESS: Base64 image saved successfully.\n";
        echo "Image path: $test_b64_image\n";
        
        // Check file permissions
        $perms = fileperms($test_b64_image);
        echo "Image permissions: " . substr(sprintf('%o', $perms), -4) . "\n";
        
        // Clean up
        if (unlink($test_b64_image)) {
            echo "Base64 image deleted successfully.\n";
        } else {
            echo "FAILED to delete base64 image.\n";
            echo "Error: " . error_get_last()['message'] . "\n";
        }
    } else {
        echo "FAILED to save base64 image!\n";
        echo "Error: " . error_get_last()['message'] . "\n";
    }
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
echo "</pre>";

// Check parent directories
echo "<h2>Parent Directories Check</h2>";
echo "<pre>";
$path = $uploads_dir;
while ($path != '/' && strlen($path) > 1) {
    $perms = fileperms($path);
    echo "$path: " . substr(sprintf('%o', $perms), -4) . " (writable: " . (is_writable($path) ? "Yes" : "No") . ")\n";
    $path = dirname($path);
}
echo "</pre>";

echo "<h2>Recommendations</h2>";
echo "<ul>";
echo "<li>Ensure the web server user (daemon on XAMPP for Mac) has write permissions to the uploads directory</li>";
echo "<li>Try setting permissions with: <code>sudo chmod -R 777 $uploads_dir</code></li>";
echo "<li>Check if SELinux or other security measures are blocking access</li>";
echo "<li>Verify that disk space is available</li>";
echo "<li>Check if the uploads directory is on a mounted volume with restrictions</li>";
echo "</ul>";
?> 