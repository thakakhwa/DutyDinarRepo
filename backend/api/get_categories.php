<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php'; // Include database connection

try {
    if (!$conn) {
        throw new Exception("Database connection failed.");
    }

    $stmt = $conn->prepare("SELECT id, name FROM categories");
    if (!$stmt) {
        throw new Exception("Failed to prepare SQL statement.");
    }

    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        print_response(false, "No categories found.");
    }

    $categories = [];
    while ($row = $result->fetch_assoc()) {
        $categories[] = [
            "id" => $row['id'],
            "name" => $row['name']
        ];
    }

    print_response(true, "Categories fetched successfully.", ["categories" => $categories]);
} catch (Exception $e) {
    print_response(false, "Error: " . $e->getMessage());
}
?>
