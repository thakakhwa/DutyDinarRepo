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

try {
    $stmt = $conn->prepare("
        SELECT c.id, c.created_at, 
               GROUP_CONCAT(u.name SEPARATOR ', ') AS participants
        FROM conversations c
        JOIN conversation_participants cp ON c.id = cp.conversation_id
        JOIN users u ON cp.user_id = u.id
        WHERE c.id IN (
            SELECT conversation_id FROM conversation_participants WHERE user_id = ?
        )
        GROUP BY c.id
        ORDER BY c.created_at DESC
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $conversations = [];
    while ($row = $result->fetch_assoc()) {
        $conversations[] = $row;
    }

    echo json_encode(['success' => true, 'conversations' => $conversations]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error fetching conversations']);
}
?>
