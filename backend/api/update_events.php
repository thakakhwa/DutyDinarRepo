<?php
// Register a shutdown function to catch fatal errors
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Fatal server error: ' . $error['message'] . ' in ' . $error['file'] . ' on line ' . $error['line']
        ]);
    }
});

// Ensure no HTML error output is sent
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set proper headers
header('Content-Type: application/json');
require_once 'cors.php';
require_once 'config.php'; // Database connection
require_once '../controller/api_response.php'; // Include the file with print_response function

session_start();

function check_authentication() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (isset($_SESSION['userId']) && isset($_SESSION['userType'])) {
        return [
            'id' => $_SESSION['userId'],
            'userType' => $_SESSION['userType']
        ];
    }
    return null;
}

function save_base64_image($base64_image, $upload_dir) {
    try {
        // Check if it's already a path
        if (strpos($base64_image, 'uploads/') !== false || strpos($base64_image, '/uploads/') !== false) {
            // If it contains /uploads/ with a leading slash, normalize it
            if (strpos($base64_image, '/uploads/') !== false) {
                return [true, str_replace('/uploads/', 'uploads/', $base64_image)];
            }
            return [true, $base64_image];
        }
        
        // Extract the image type and base64 data
        if (preg_match('/^data:image\/(\w+);base64,/', $base64_image, $type)) {
            // Log the length of the base64 string
            $base64_length = strlen($base64_image);
            error_log("Processing base64 image, length: " . $base64_length);
            
            $image_data = substr($base64_image, strpos($base64_image, ',') + 1);
            $image_type = strtolower($type[1]); // jpg, png, gif, etc.

            if (!in_array($image_type, ['jpg', 'jpeg', 'png', 'gif'])) {
                error_log("Unsupported image type: " . $image_type);
                return [false, 'Unsupported image type'];
            }

            $image_data = base64_decode($image_data);
            if ($image_data === false) {
                error_log("Base64 decode failed");
                return [false, 'Base64 decode failed'];
            }
            
            // Generate unique filename
            $file_name = uniqid('event_', true) . '.' . $image_type;
            $file_path = $upload_dir . DIRECTORY_SEPARATOR . $file_name;

            // Save the image file
            if (file_put_contents($file_path, $image_data) === false) {
                error_log("Failed to save image file at path: " . $file_path);
                return [false, 'Failed to save image file'];
            }
            
            $result_path = 'uploads/' . $file_name;
            error_log("Image saved successfully as: " . $result_path);
            return [true, $result_path];
        } else {
            error_log("Invalid image format: " . substr($base64_image, 0, 50) . "...");
            return [false, 'Invalid image format'];
        }
    } catch (Exception $e) {
        error_log("Exception in save_base64_image: " . $e->getMessage());
        return [false, 'Error processing image: ' . $e->getMessage()];
    }
}

try {
    // Debug log for request
    error_log("Received update_events.php request. Method: " . $_SERVER['REQUEST_METHOD']);
    
    // Get input data
    $input = file_get_contents("php://input");
    error_log("Raw input length: " . strlen($input));
    if (strlen($input) > 100) {
        error_log("Raw input (truncated): " . substr($input, 0, 100) . "...");
    } else {
        error_log("Raw input: " . $input);
    }
    
    $inputData = json_decode($input, true);
    if (!$inputData) {
        error_log("Failed to parse JSON input. JSON error: " . json_last_error_msg());
        print_response(false, 'Invalid JSON input: ' . json_last_error_msg());
    }

    // Check if the user is logged in by validating the session
    $user = check_authentication();
    if (!$user || !in_array($user['userType'], ['seller', 'admin'])) {
        print_response(false, 'Unauthorized: Only authenticated sellers or admins can update events');
    }

    // Validate required fields
    if (empty($inputData['id'])) {
        print_response(false, 'Event ID is required');
    }
    
    if (empty($inputData['name'])) {
        print_response(false, 'Event name is required');
    }
    
    if (empty($inputData['description'])) {
        print_response(false, 'Event description is required');
    }
    
    if (empty($inputData['event_date'])) {
        print_response(false, 'Event date is required');
    }
    
    if (empty($inputData['location'])) {
        print_response(false, 'Event location is required');
    }
    
    if (!isset($inputData['available_tickets'])) {
        print_response(false, 'Available tickets is required');
    }
    
    // Image is optional now
    $image_url = isset($inputData['image_url']) ? $inputData['image_url'] : '';
    
    // Get the event ID
    $id = intval($inputData['id']);

    // First check if the event exists and belongs to the user
    $stmt = $conn->prepare("SELECT seller_id, image_url FROM events WHERE id = ?");
    if (!$stmt) {
        error_log("Failed to prepare query: " . $conn->error);
        print_response(false, 'Failed to prepare query: ' . $conn->error);
    }

    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        print_response(false, 'Event not found');
    }

    $event = $result->fetch_assoc();
    $stmt->close();

    // Check if the user is the owner or an admin
    if ($user['userType'] !== 'admin' && $event['seller_id'] != $user['id']) {
        print_response(false, 'Unauthorized: You can only update your own events');
    }

    // ALWAYS use the existing image URL from the database
    $image_url = $event['image_url'];
    error_log("Using existing image URL from database: " . $image_url);

    // Prepare the event data from the input
    $name = $inputData['name'];
    $description = $inputData['description'];
    $event_date = $inputData['event_date'];
    $location = $inputData['location'];
    $available_tickets = intval($inputData['available_tickets']);

    $upload_dir = dirname(__DIR__) . '/uploads';

    // Ensure upload directory exists
    if (!is_dir($upload_dir)) {
        if (!mkdir($upload_dir, 0755, true)) {
            error_log("Failed to create image upload directory: " . $upload_dir);
            print_response(false, 'Failed to create image upload directory.');
        }
    }

    // Check if the image URL is a base64 string or a file path
    if (empty($image_url) || $image_url === '0') {
        // No image or invalid image, use a default or empty value
        $image_url = ''; // or set to a default image path if you have one
    } else if (strpos($image_url, 'data:image/') === 0) {
        // It's a base64 image, save it
        list($success, $result) = save_base64_image($image_url, $upload_dir);
        if (!$success) {
            error_log("Image upload error: " . $result);
            print_response(false, 'Image upload error: ' . $result);
        } else {
            $image_url = $result;
        }
    } else if (strpos($image_url, 'uploads/') === false && strpos($image_url, '/uploads/') === false) {
        // Not a base64 image and not from uploads directory
        error_log("Invalid image URL format: " . $image_url);
        print_response(false, 'Invalid image URL format');
    }

    // Begin transaction
    $conn->begin_transaction();

    try {
        // Debug log the values being used for update
        error_log("Updating event with ID: " . $id);
        error_log("Image URL to be saved: " . $image_url);
        
        // Update event
        $stmt = $conn->prepare("UPDATE events SET name = ?, description = ?, event_date = ?, location = ?, available_tickets = ?, updated_at = NOW() WHERE id = ?");
        if (!$stmt) {
            error_log("Failed to prepare SQL statement: " . $conn->error);
            throw new Exception("Failed to prepare SQL statement: " . $conn->error);
        }

        $stmt->bind_param("ssssii", $name, $description, $event_date, $location, $available_tickets, $id);
        if (!$stmt->execute()) {
            error_log("Failed to execute statement: " . $stmt->error);
            throw new Exception("Failed to execute statement: " . $stmt->error);
        }

        $affected_rows = $stmt->affected_rows;
        $stmt->close();
        
        if ($affected_rows === 0) {
            $conn->rollback();
            error_log("No rows affected. Event ID may not exist: " . $id);
            print_response(false, 'No event updated. The event may not exist or no changes were made.');
        } else {
            // Verify the update by fetching the event again
            $verify_stmt = $conn->prepare("SELECT image_url FROM events WHERE id = ?");
            $verify_stmt->bind_param("i", $id);
            $verify_stmt->execute();
            $verify_result = $verify_stmt->get_result();
            $updated_event = $verify_result->fetch_assoc();
            $verify_stmt->close();
            
            error_log("After update, image_url in database: " . ($updated_event['image_url'] ?? 'null'));
            
            $conn->commit();
            error_log("Event updated successfully. ID: " . $id);
            print_response(true, 'Event updated successfully.');
        }
    } catch (Exception $e) {
        $conn->rollback();
        error_log("Error updating event: " . $e->getMessage());
        print_response(false, 'Failed to update event: ' . $e->getMessage());
    }
} catch (Exception $e) {
    error_log("Uncaught exception: " . $e->getMessage());
    print_response(false, 'Server error: ' . $e->getMessage());
}
?> 