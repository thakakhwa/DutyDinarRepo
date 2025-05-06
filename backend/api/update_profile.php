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
    if (isset($_SESSION['userId'])) {
        return $_SESSION['userId'];
    }
    return null;
}

$userId = check_authentication();
if (!$userId) {
    print_response(false, 'Unauthorized: Please login.');
}

$inputData = json_decode(file_get_contents("php://input"), true);

$name = isset($inputData['name']) ? trim($inputData['name']) : null;
$companyName = isset($inputData['companyName']) ? trim($inputData['companyName']) : null;
$currentPassword = isset($inputData['currentPassword']) ? $inputData['currentPassword'] : null;
$newPassword = isset($inputData['newPassword']) ? $inputData['newPassword'] : null;
$retypeNewPassword = isset($inputData['retypeNewPassword']) ? $inputData['retypeNewPassword'] : null;

if (!$name && !$companyName && !$newPassword) {
    print_response(false, 'No data to update.');
}

try {
    $conn->begin_transaction();

    if ($name !== null) {
        $stmt = $conn->prepare("UPDATE users SET name = ? WHERE id = ?");
        if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
        $stmt->bind_param("si", $name, $userId);
        if (!$stmt->execute()) throw new Exception("Execute failed: " . $stmt->error);
        $stmt->close();
    }

    if ($companyName !== null) {
        $stmt = $conn->prepare("UPDATE users SET companyName = ? WHERE id = ?");
        if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
        $stmt->bind_param("si", $companyName, $userId);
        if (!$stmt->execute()) throw new Exception("Execute failed: " . $stmt->error);
        $stmt->close();
    }

    if ($newPassword !== null) {
        if (!$currentPassword) {
            throw new Exception("Current password is required to change password.");
        }
        if ($newPassword !== $retypeNewPassword) {
            throw new Exception("New password and retype password do not match.");
        }
        // Verify current password
        $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
        if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
        $stmt->bind_param("i", $userId);
        if (!$stmt->execute()) throw new Exception("Execute failed: " . $stmt->error);
        $result = $stmt->get_result();
        if ($result->num_rows !== 1) {
            throw new Exception("User not found.");
        }
        $row = $result->fetch_assoc();
        $stmt->close();

        if (!password_verify($currentPassword, $row['password'])) {
            throw new Exception("Current password is incorrect.");
        }

        // Hash the new password before storing
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
        $stmt->bind_param("si", $hashedPassword, $userId);
        if (!$stmt->execute()) throw new Exception("Execute failed: " . $stmt->error);
        $stmt->close();
    }

    $conn->commit();

    print_response(true, 'Profile updated successfully.');
} catch (Exception $e) {
    $conn->rollback();
    error_log("Error updating profile: " . $e->getMessage());

    // Additional error logging to a file
    file_put_contents(__DIR__ . '/update_profile_error.log', date('Y-m-d H:i:s') . " - " . $e->getMessage() . PHP_EOL, FILE_APPEND);

    print_response(false, 'Failed to update profile: ' . $e->getMessage());
}
?>
