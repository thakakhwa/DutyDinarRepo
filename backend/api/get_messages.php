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

if (!isset($_GET['conversation_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing conversation_id']);
    exit;
}

$conversation_id = intval($_GET['conversation_id']);

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

    $stmt = $conn->prepare("
        SELECT m.id, m.sender_id, u.name as sender_name, m.message, m.created_at
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ?
        ORDER BY m.created_at ASC
    ");
    $stmt->bind_param("i", $conversation_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $messages = [];
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }

    echo json_encode(['success' => true, 'messages' => $messages]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error fetching messages']);
}
?>
