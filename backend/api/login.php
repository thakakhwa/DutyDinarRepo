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
    print_response(false, "Email and password are required.");
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
    print_response(false, "Invalid email or password.");
}

$user = $result->fetch_assoc();

// Verify password
if (!password_verify($password, $user['password'])) {
    print_response(false, "Invalid email or password.");
}

// Successful login: store user data in session
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
print_response(true, "Login successful.", $userData);

?>
