<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config.php';
require_once 'cors.php';

session_start();
header('Content-Type: application/json');

error_log("Session data: " . print_r($_SESSION, true));
error_log("Raw input: " . file_get_contents('php://input'));

function save_base64_image($base64_image, $upload_dir) {
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

    $file_name = uniqid('event_', true) . '.' . $image_type;
    $file_path = $upload_dir . DIRECTORY_SEPARATOR . $file_name;

    if (file_put_contents($file_path, $image_data) === false) {
        error_log("Failed to save image file at path: " . $file_path);
        return [false, 'Failed to save image file'];
    }

    return [true, $file_name];
}

try {
    if (!isset($_SESSION['userId']) || !isset($_SESSION['userType']) || !in_array($_SESSION['userType'], ['seller', 'admin'])) {
        http_response_code(403);
        echo json_encode([
            'status' => false,
            'message' => 'Unauthorized: Only authenticated sellers or admins can add events'
        ]);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        throw new Exception('Invalid JSON input', 400);
    }

    $requiredFields = ['name', 'description', 'event_date', 'location', 'price', 'available_tickets', 'image_url'];
    foreach ($requiredFields as $field) {
        if (!isset($input[$field]) || $input[$field] === '') {
            throw new Exception("Missing required field: $field", 400);
        }
    }

    if (!is_string($input['name']) || !is_string($input['description']) || !is_string($input['event_date']) || !is_string($input['location']) || !is_string($input['image_url'])) {
        throw new Exception('Invalid data type for string fields', 400);
    }
    if (!is_numeric($input['price']) || !is_numeric($input['available_tickets'])) {
        throw new Exception('Price and available_tickets must be numeric', 400);
    }

    if ($_SESSION['userType'] === 'admin' && isset($input['seller_id']) && is_numeric($input['seller_id'])) {
        $sellerId = intval($input['seller_id']);
    } else {
        $sellerId = $_SESSION['userId'];
    }

    $name = $input['name'];
    $description = $input['description'];
    $eventDate = $input['event_date'];
    $location = $input['location'];
    $price = floatval($input['price']);
    $availableTickets = intval($input['available_tickets']);
    $imageBase64 = $input['image_url'];

    $upload_dir = __DIR__ . '/../uploads';

    if (!is_dir($upload_dir)) {
        if (!mkdir($upload_dir, 0755, true)) {
            throw new Exception('Failed to create image upload directory', 500);
        }
    }

    list($success, $result) = save_base64_image($imageBase64, $upload_dir);
    if (!$success) {
        throw new Exception('Image upload error: ' . $result, 500);
    }

    $imageUrl = 'uploads/' . $result;

    $stmt = $conn->prepare("INSERT INTO events (seller_id, name, description, event_date, location, price, available_tickets, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        throw new Exception('Database prepare failed: ' . $conn->error, 500);
    }

    $bind = $stmt->bind_param("issssdis", $sellerId, $name, $description, $eventDate, $location, $price, $availableTickets, $imageUrl);
    if (!$bind) {
        throw new Exception('Parameter binding failed: ' . $stmt->error, 500);
    }

    if (!$stmt->execute()) {
        throw new Exception('Database execute failed: ' . $stmt->error, 500);
    }

    echo json_encode([
        'status' => true,
        'message' => 'Event added successfully',
        'eventId' => $stmt->insert_id
    ]);
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    error_log('Add Event API error: ' . $e->getMessage());
    echo json_encode([
        'status' => false,
        'message' => $e->getMessage()
    ]);
}
?>
