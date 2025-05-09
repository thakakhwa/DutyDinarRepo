<?php
require_once 'cors.php';
require_once 'config.php';
session_start();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (!isset($_SESSION['userId'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Please login.', 'auth_required' => true]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['user_id']) || empty($input['user_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'user_id is required']);
    exit;
}

$currentUserId = $_SESSION['userId'];
$otherUserId = intval($input['user_id']);

try {
    // Check if a conversation already exists between the two users
    $stmt = $conn->prepare("
        SELECT c.id 
        FROM conversations c
        JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = ?
        JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = ?
        LIMIT 1
    ");
    $stmt->bind_param("ii", $currentUserId, $otherUserId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // Conversation exists, return it
        echo json_encode(['success' => true, 'conversation_id' => $row['id'], 'message' => 'Conversation opened']);
        exit;
    }

    // No conversation exists, create a new one
    $conn->begin_transaction();

    $insertConv = $conn->prepare("INSERT INTO conversations () VALUES ()");
    $insertConv->execute();
    $conversationId = $conn->insert_id;

    $insertPart = $conn->prepare("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)");
    $insertPart->bind_param("ii", $conversationId, $currentUserId);
    $insertPart->execute();
    $insertPart->bind_param("ii", $conversationId, $otherUserId);
    $insertPart->execute();

    $conn->commit();

    echo json_encode(['success' => true, 'conversation_id' => $conversationId, 'message' => 'Conversation created']);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
