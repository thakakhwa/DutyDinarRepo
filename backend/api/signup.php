<?php
require_once 'cors.php';
require_once 'config.php'; // Include your database connection

// Get JSON input
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['email']) || !isset($input['password']) || !isset($input['userType'])) {
    print_response(false, "Email, password, and user type are required.");
}

$email = $input['email'];
$password = password_hash($input['password'], PASSWORD_DEFAULT);
$userType = $input['userType'];
$name = isset($input['name']) ? $input['name'] : '';
$companyName = isset($input['companyName']) ? $input['companyName'] : null;

// Check if email already exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    print_response(false, "Email is already registered.");
}

// Insert new user
$stmt = $conn->prepare("INSERT INTO users (name, email, password, userType, companyName) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $name, $email, $password, $userType, $companyName);

if ($stmt->execute()) {
    print_response(true, "Account created successfully. Please login.");
} else {
    print_response(false, "Error creating account.");
}
