<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/cart_error.log');

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php'; // Database connection

try {
    session_start();

    $user = check_authentication();
    $user_id = $user['id'];

    $inputData = json_decode(file_get_contents("php://input"), true);

    if (empty($inputData['action'])) {
        echo json_encode(['success' => false, 'message' => 'Action is required.']);
        exit;
    }

    $action = $inputData['action'];

    if ($action === 'add') {
        if (empty($inputData['product_id']) || !isset($inputData['quantity'])) {
            echo json_encode(['success' => false, 'message' => 'Product ID and quantity are required for adding to cart.']);
            exit;
        }
        $product_id = $inputData['product_id'];
        $quantity = $inputData['quantity'];

        // Check MOQ from products table
        $moq_stmt = $conn->prepare("SELECT minOrderQuantity FROM products WHERE id = ?");
        if (!$moq_stmt) {
            echo json_encode(['success' => false, 'message' => 'Failed to prepare MOQ query.']);
            exit;
        }
        $moq_stmt->bind_param("i", $product_id);
        $moq_stmt->execute();
        $moq_result = $moq_stmt->get_result();
        if ($moq_result->num_rows === 0) {
            echo json_encode(['success' => false, 'message' => 'Product not found.']);
            exit;
        }
        $moq_row = $moq_result->fetch_assoc();
        $moq = (int)$moq_row['minOrderQuantity'];
        $moq_stmt->close();

        if ($quantity < $moq) {
            echo json_encode(['success' => false, 'message' => "Quantity must be at least the minimum order quantity ($moq)."]);
            exit;
        }

        // Insert or update cart item
        // Check if item already in cart
        $check_stmt = $conn->prepare("SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?");
        if (!$check_stmt) {
            echo json_encode(['success' => false, 'message' => 'Failed to prepare check cart query.']);
            exit;
        }
        $check_stmt->bind_param("ii", $user_id, $product_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();

        if ($check_result->num_rows > 0) {
            // Update quantity
            $existing = $check_result->fetch_assoc();
            $new_quantity = $existing['quantity'] + $quantity;
            if ($new_quantity < $moq) {
                echo json_encode(['success' => false, 'message' => "Total quantity must be at least the minimum order quantity ($moq)."]);
                exit;
            }
            $update_stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?");
            if (!$update_stmt) {
                echo json_encode(['success' => false, 'message' => 'Failed to prepare update cart query.']);
                exit;
            }
            $update_stmt->bind_param("iii", $new_quantity, $user_id, $product_id);
            if ($update_stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Cart updated successfully.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to update cart.']);
            }
            $update_stmt->close();
        } else {
            // Insert new item
            $insert_stmt = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
            if (!$insert_stmt) {
                echo json_encode(['success' => false, 'message' => 'Failed to prepare insert cart query.']);
                exit;
            }
            $insert_stmt->bind_param("iii", $user_id, $product_id, $quantity);
            if ($insert_stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Product added to cart successfully.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to add product to cart.']);
            }
            $insert_stmt->close();
        }
        $check_stmt->close();

    } elseif ($action === 'update') {
        if (empty($inputData['product_id']) || !isset($inputData['quantity'])) {
            echo json_encode(['success' => false, 'message' => 'Product ID and quantity are required for updating cart.']);
            exit;
        }
        $product_id = $inputData['product_id'];
        $quantity = $inputData['quantity'];

        // Check MOQ
        $moq_stmt = $conn->prepare("SELECT minOrderQuantity FROM products WHERE id = ?");
        if (!$moq_stmt) {
            echo json_encode(['success' => false, 'message' => 'Failed to prepare MOQ query.']);
            exit;
        }
        $moq_stmt->bind_param("i", $product_id);
        $moq_stmt->execute();
        $moq_result = $moq_stmt->get_result();
        if ($moq_result->num_rows === 0) {
            echo json_encode(['success' => false, 'message' => 'Product not found.']);
            exit;
        }
        $moq_row = $moq_result->fetch_assoc();
        $moq = (int)$moq_row['minOrderQuantity'];
        $moq_stmt->close();

        if ($quantity < $moq) {
            echo json_encode(['success' => false, 'message' => "Quantity must be at least the minimum order quantity ($moq)."]);
            exit;
        }

        $update_stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?");
        if (!$update_stmt) {
            echo json_encode(['success' => false, 'message' => 'Failed to prepare update cart query.']);
            exit;
        }
        $update_stmt->bind_param("iii", $quantity, $user_id, $product_id);
        if ($update_stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Cart updated successfully.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update cart.']);
        }
        $update_stmt->close();

    } elseif ($action === 'remove') {
        if (empty($inputData['product_id'])) {
            echo json_encode(['success' => false, 'message' => 'Product ID is required for removing from cart.']);
            exit;
        }
        $product_id = $inputData['product_id'];

        // Check MOQ before removing - ensure quantity after removal is not less than MOQ
        // Since removing means removing the item entirely, we allow removal only if MOQ is 0 or no MOQ restriction
        $moq_stmt = $conn->prepare("SELECT minOrderQuantity FROM products WHERE id = ?");
        if (!$moq_stmt) {
            echo json_encode(['success' => false, 'message' => 'Failed to prepare MOQ query.']);
            exit;
        }
        $moq_stmt->bind_param("i", $product_id);
        $moq_stmt->execute();
        $moq_result = $moq_stmt->get_result();
        if ($moq_result->num_rows === 0) {
            echo json_encode(['success' => false, 'message' => 'Product not found.']);
            exit;
        }
        $moq_row = $moq_result->fetch_assoc();
        $moq = (int)$moq_row['minOrderQuantity'];
        $moq_stmt->close();

        if ($moq > 0) {
            echo json_encode(['success' => false, 'message' => "Cannot remove product with MOQ requirement."]);
            exit;
        }

        $delete_stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
        if (!$delete_stmt) {
            echo json_encode(['success' => false, 'message' => 'Failed to prepare delete cart query.']);
            exit;
        }
        $delete_stmt->bind_param("ii", $user_id, $product_id);
        if ($delete_stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Product removed from cart successfully.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to remove product from cart.']);
        }
        $delete_stmt->close();

    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action.']);
    }
} catch (Exception $e) {
    error_log("Cart API error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Internal server error.']);
}
?>
