<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Start the session to manage the session data
session_start();

// Include your database connection
require_once 'config.php';

// Get JSON input
$input = json_decode(file_get_contents("php://input"), true);

// Check if email and password are set
if (!isset($input['email']) || !isset($input['password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Email and password are required.'
    ]);
    exit;
}

$email = $input['email'];
$password = $input['password'];

// Check user in the database
$stmt = $conn->prepare("SELECT id, password, userType FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

// If no user found
if ($result->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email or password.'
    ]);
    exit;
}

$user = $result->fetch_assoc();

// Verify password
if (!password_verify($password, $user['password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email or password.'
    ]);
    exit;
}

// Successful login: store user data in session
// No need for custom session ID in most cases
$_SESSION['user'] = [
    'id' => $user['id'],
    'email' => $email,
    'userType' => $user['userType']
];

// Prepare the response
$userData = [
    "id" => $user['id'],
    "email" => $email,
    "userType" => $user['userType']
];

// Send success response with user data
echo json_encode([
    'success' => true,
    'message' => 'Login successful.',
    'data' => $userData
]);
?>
