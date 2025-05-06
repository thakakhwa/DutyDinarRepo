<?php
// Ensure no output before headers
if (headers_sent($file, $line)) {
    die("Headers already sent in $file on line $line");
}

// Force CORS headers
require_once 'cors.php';
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");
session_start();

// Handle OPTIONS (Preflight) request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Now include config and run the query
require_once 'config.php';

if (!isset($_SESSION['userId']) || !isset($_SESSION['userType']) || $_SESSION['userType'] !== 'seller') {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized. You must be logged in as a seller.'
    ]);
    exit;
}

$user_id = $_SESSION['userId'];

try {
    if (!$conn) {
        throw new Exception("Database connection failed: " . mysqli_connect_error());
    }

    // Count events for this seller
    $stmt = $conn->prepare("SELECT COUNT(*) as event_count FROM events WHERE seller_id = ?");
    if (!$stmt) {
        throw new Exception("Failed to prepare query: " . $conn->error);
    }
    
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    $row = $result->fetch_assoc();
    $event_count = (int)$row['event_count'];
    
    // Return success with count
    echo json_encode([
        'success' => true,
        'message' => 'Event count fetched successfully',
        'event_count' => $event_count
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => "Server Error: " . $e->getMessage()
    ]);
}
?> 