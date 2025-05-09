<?php
require_once 'cors.php';
require_once 'config.php';
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['userId'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'User not logged in', 'auth_required' => true]);
    exit;
}

$user_id = $_SESSION['userId'];

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['conversation_id']) || !isset($data['message'])) {
    echo json_encode(['success' => false, 'message' => 'Missing parameters']);
    exit;
}

$conversation_id = intval($data['conversation_id']);
$message = trim($data['message']);

if ($message === '') {
    echo json_encode(['success' => false, 'message' => 'Message cannot be empty']);
    exit;
}

try {
    // Check if user is participant of the conversation
    $stmt_check = $conn->prepare("SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?");
    $stmt_check->bind_param("ii", $conversation_id, $user_id);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();

    if ($result_check->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO messages (conversation_id, sender_id, message) VALUES (?, ?, ?)");
    $stmt->bind_param("iis", $conversation_id, $user_id, $message);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Message sent']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to send message']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error sending message']);
}
?>
