<?php
require_once 'cors.php';
session_start();

header('Content-Type: application/json');

if (isset($_SESSION['userId'], $_SESSION['username'], $_SESSION['userType'])) {
    // Connect to database
    require_once 'config.php';

    $userId = $_SESSION['userId'];

    $stmt = $conn->prepare("SELECT id, name, email, userType, companyName, created_at FROM users WHERE id = ?");
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
        exit;
    }

    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows === 1) {
        $user = $result->fetch_assoc();
        echo json_encode(['success' => true, 'data' => $user]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }

    $stmt->close();
    $conn->close();
} else {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No active session']);
}
?>
