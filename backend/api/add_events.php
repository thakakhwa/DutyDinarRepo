<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'cors.php';
require_once 'config.php'; // Database connection

session_start();
header('Content-Type: application/json');

error_log("Session data: " . print_r($_SESSION, true));
error_log("Raw input: " . file_get_contents('php://input'));

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
    // Extract the image type and base64 data
    if (preg_match('/^data:image\/(\w+);base64,/', $base64_image, $type)) {
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
    } else {
        error_log("Invalid base64 image format");
        return [false, 'Invalid base64 image format'];
    }

    // Generate unique filename
    $file_name = uniqid('event_', true) . '.' . $image_type;
    $file_path = $upload_dir . DIRECTORY_SEPARATOR . $file_name;

    // Save the image file
    if (file_put_contents($file_path, $image_data) === false) {
        error_log("Failed to save image file at path: " . $file_path);
        return [false, 'Failed to save image file'];
    }

    return [true, $file_name];
}

// Check if the user is logged in by validating the session
$user = check_authentication();
if (!$user || !in_array($user['userType'], ['seller', 'admin'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Only authenticated sellers or admins can add events']);
    exit;
}

// Decode input JSON
$inputData = json_decode(file_get_contents("php://input"), true);
if (empty($inputData['name']) || empty($inputData['description']) || empty($inputData['event_date']) || empty($inputData['location']) || empty($inputData['available_tickets']) || empty($inputData['image_url'])) {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

// Determine seller_id: if admin and seller_id provided in input, use it; else use logged-in user id
if ($user['userType'] === 'admin' && isset($inputData['seller_id'])) {
    $seller_id = intval($inputData['seller_id']);
} else {
    $seller_id = $user['id'];
}

// Prepare the event data from the input
$name = $inputData['name'];
$description = $inputData['description'];
$event_date = $inputData['event_date'];
$location = $inputData['location'];
$available_tickets = intval($inputData['available_tickets']);
$image_base64 = $inputData['image_url'];

$upload_dir = dirname(__DIR__) . '/uploads';

// Ensure upload directory exists
if (!is_dir($upload_dir)) {
    if (!mkdir($upload_dir, 0755, true)) {
        error_log("Failed to create image upload directory: " . $upload_dir);
        echo json_encode(['success' => false, 'message' => 'Failed to create image upload directory.']);
        exit;
    }
}

// Save the base64 image and get filename
list($success, $result) = save_base64_image($image_base64, $upload_dir);
if (!$success) {
    error_log("Image upload error: " . $result);
    echo json_encode(['success' => false, 'message' => 'Image upload error: ' . $result]);
    exit;
}

$image_url = 'uploads/' . $result; // Relative URL to save in DB

// Begin transaction
$conn->begin_transaction();

try {
    // Insert event
    $stmt = $conn->prepare("INSERT INTO events (seller_id, name, description, event_date, location, available_tickets, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
    if (!$stmt) {
        error_log("Failed to prepare SQL statement: " . $conn->error);
        throw new Exception("Failed to prepare SQL statement: " . $conn->error);
    }

    $bind = $stmt->bind_param("issssis", $seller_id, $name, $description, $event_date, $location, $available_tickets, $image_url);
    if (!$bind) {
        error_log("Failed to bind parameters: " . $stmt->error);
        throw new Exception("Failed to bind parameters: " . $stmt->error);
    }

    if (!$stmt->execute()) {
        error_log("Failed to execute statement: " . $stmt->error);
        throw new Exception("Failed to execute statement: " . $stmt->error);
    }

    $stmt->close();

    // Commit transaction
    $conn->commit();

    echo json_encode(['success' => true, 'message' => 'Event added successfully.']);
} catch (Exception $e) {
    $conn->rollback();
    error_log("Error adding event: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to add event: ' . $e->getMessage()]);
}
?>
