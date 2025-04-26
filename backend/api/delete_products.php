<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'cors.php';
require_once 'config.php'; // Database connection

session_start();
header('Content-Type: application/json');

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

$input = json_decode(file_get_contents("php://input"), true);
if ($input === null) {
    parse_str(file_get_contents("php://input"), $input);
}
if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Product ID is required']);
    exit;
}

$user = check_authentication();
if (!$user) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Please login.']);
    exit;
}

$id = intval($input['id']);

$stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
$stmt->bind_param('i', $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Product deleted successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to delete product']);
}
$stmt->close();
?>
