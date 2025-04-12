<?php
session_start();
header("Content-Type: application/json");
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $buyer_id = $_SESSION['user_id'] ?? null;
    if (!$buyer_id) {
        throw new Exception("Authentication required");
    }

    switch ($method) {
        case 'GET':
            $stmt = $conn->prepare("
                SELECT c.id, c.product_id, c.quantity, 
                       p.name, p.price, p.image_url 
                FROM cart c
                JOIN products p ON c.product_id = p.id
                WHERE c.buyer_id = ?
            ");
            $stmt->execute([$buyer_id]);
            $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $cartItems]);
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            $product_id = (int)$data['product_id'];
            $quantity = (int)($data['quantity'] ?? 1);

            $stmt = $conn->prepare("
                INSERT INTO cart (buyer_id, product_id, quantity)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE quantity = quantity + ?
            ");
            $stmt->execute([$buyer_id, $product_id, $quantity, $quantity]);
            echo json_encode(["success" => true]);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents("php://input"), true);
            $stmt = $conn->prepare("
                UPDATE cart SET quantity = ?
                WHERE id = ? AND buyer_id = ?
            ");
            $stmt->execute([$data['quantity'], $data['id'], $buyer_id]);
            echo json_encode(["success" => true]);
            break;

        case 'DELETE':
            $id = (int)$_GET['id'];
            $stmt = $conn->prepare("DELETE FROM cart WHERE id = ? AND buyer_id = ?");
            $stmt->execute([$id, $buyer_id]);
            echo json_encode(["success" => true]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Method not allowed"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>