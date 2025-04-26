<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'cors.php';
require_once 'config.php';
session_start();

header('Content-Type: application/json');

function check_authentication() {
    if (!isset($_SESSION['userId']) || $_SESSION['userType'] !== 'admin') {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized: Admin access required.']);
        exit;
    }
}

check_authentication();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // List users with optional filters, search, pagination
            $search = isset($_GET['search']) ? trim($_GET['search']) : '';
            $filter = isset($_GET['filter']) ? $_GET['filter'] : 'all';
            $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
            $limit = 10;
            $offset = ($page - 1) * $limit;

            $whereClauses = [];
            $params = [];
            $paramTypes = '';

            if ($search !== '') {
                $whereClauses[] = "(name LIKE CONCAT('%', ?, '%') OR email LIKE CONCAT('%', ?, '%'))";
                $params[] = $search;
                $params[] = $search;
                $paramTypes .= 'ss';
            }

            if ($filter === 'buyers') {
                $whereClauses[] = "userType = 'buyer'";
            } elseif ($filter === 'sellers') {
                $whereClauses[] = "userType = 'seller'";
            } elseif ($filter === 'admins') {
                $whereClauses[] = "userType = 'admin'";
            } elseif ($filter === 'active') {
                // Assuming active means users with recent activity or status, but no status column in DB
                // For now, no filter for active
            } elseif ($filter === 'inactive') {
                // No status column, so no filter
            }

            $whereSQL = '';
            if (count($whereClauses) > 0) {
                $whereSQL = 'WHERE ' . implode(' AND ', $whereClauses);
            }

            $countSQL = "SELECT COUNT(*) as total FROM users $whereSQL";
            $stmt = $conn->prepare($countSQL);
            if ($paramTypes !== '') {
                $stmt->bind_param($paramTypes, ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            $total = 0;
            if ($row = $result->fetch_assoc()) {
                $total = intval($row['total']);
            }
            $stmt->close();

            // Append LIMIT and OFFSET directly to SQL string to avoid binding issues
            $sql = "SELECT id, name, email, userType, companyName, created_at FROM users $whereSQL ORDER BY created_at DESC LIMIT " . intval($limit) . " OFFSET " . intval($offset);
            $stmt = $conn->prepare($sql);
            if ($paramTypes !== '') {
                $stmt->bind_param($paramTypes, ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();

            $users = [];
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
            $stmt->close();

            echo json_encode([
                'success' => true,
                'data' => $users,
                'total' => $total,
                'page' => $page,
                'limit' => $limit
            ]);
            break;

        case 'POST':
            // Add new user
            $input = json_decode(file_get_contents('php://input'), true);
            if (!isset($input['name'], $input['email'], $input['password'], $input['userType'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Missing required fields']);
                exit;
            }
            $name = $input['name'];
            $email = $input['email'];
            $password = password_hash($input['password'], PASSWORD_DEFAULT);
            $userType = $input['userType'];
            $companyName = isset($input['companyName']) ? $input['companyName'] : null;

            // Check if email exists
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $stmt->store_result();
            if ($stmt->num_rows > 0) {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'Email already exists']);
                exit;
            }
            $stmt->close();

            $stmt = $conn->prepare("INSERT INTO users (name, email, password, userType, companyName) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param('sssss', $name, $email, $password, $userType, $companyName);
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'User added successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to add user']);
            }
            $stmt->close();
            break;

        case 'PUT':
            // Edit user
            $input = json_decode(file_get_contents('php://input'), true);
            if (!isset($input['id'], $input['name'], $input['email'], $input['userType'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Missing required fields']);
                exit;
            }
            $id = intval($input['id']);
            $name = $input['name'];
            $email = $input['email'];
            $userType = $input['userType'];
            $companyName = isset($input['companyName']) ? $input['companyName'] : null;

            // Check if email exists for other user
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
            $stmt->bind_param('si', $email, $id);
            $stmt->execute();
            $stmt->store_result();
            if ($stmt->num_rows > 0) {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'Email already exists']);
                exit;
            }
            $stmt->close();

            $stmt = $conn->prepare("UPDATE users SET name = ?, email = ?, userType = ?, companyName = ? WHERE id = ?");
            $stmt->bind_param('ssssi', $name, $email, $userType, $companyName, $id);
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'User updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to update user']);
            }
            $stmt->close();
            break;

        case 'DELETE':
            // Delete user
            $input = json_decode(file_get_contents("php://input"), true);
            if ($input === null) {
                // Fallback to parse_str for URL-encoded form data
                parse_str(file_get_contents("php://input"), $input);
            }
            if (!isset($input['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'User ID is required']);
                exit;
            }
            $id = intval($input['id']);

            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            $stmt->bind_param('i', $id);
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to delete user']);
            }
            $stmt->close();
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    error_log('Admin Users API error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>
