<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/unbook_event_error.log');

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php'; // Database connection

session_start();

function check_authentication() {
    if (!isset($_SESSION['userId'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized: No active session']);
        exit;
    }
    return ['id' => $_SESSION['userId']];
}

try {
    $user = check_authentication();
    $user_id = $user['id'];

    $inputData = json_decode(file_get_contents("php://input"), true);

    if (empty($inputData['event_id'])) {
        echo json_encode(['success' => false, 'message' => 'Event ID is required.']);
        exit;
    }

    $event_id = (int)$inputData['event_id'];

    // Check if booking exists
    $check_stmt = $conn->prepare("SELECT quantity FROM event_bookings WHERE user_id = ? AND event_id = ?");
    if (!$check_stmt) {
        echo json_encode(['success' => false, 'message' => 'Failed to prepare booking check.']);
        exit;
    }
    $check_stmt->bind_param("ii", $user_id, $event_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    if ($check_result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'No booking found for this event.']);
        exit;
    }
    $check_stmt->close();

    // Start transaction
    $conn->begin_transaction();

    // Delete booking
    $stmt = $conn->prepare("DELETE FROM event_bookings WHERE user_id = ? AND event_id = ?");
    if (!$stmt) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Failed to prepare delete statement.']);
        exit;
    }
    $stmt->bind_param("ii", $user_id, $event_id);
    if (!$stmt->execute()) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Failed to unbook event.']);
        exit;
    }
    $stmt->close();

    $conn->commit();

    echo json_encode(['success' => true, 'message' => 'Event unbooked successfully.']);

} catch (Exception $e) {
    $conn->rollback();
    error_log("Unbook Event API error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Internal server error.']);
}
?>
