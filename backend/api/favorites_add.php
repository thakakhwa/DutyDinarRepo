<?php
// api/favorites_add.php - Add item to favorites
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // For debugging
    error_log("Add to favorites request data: " . json_encode($data));
    
    if (!isset($data['buyer_id'])) {
        echo json_encode(['success' => false, 'message' => 'Buyer ID is required']);
        exit;
    }
    
    if (!isset($data['product_id']) && !isset($data['event_id'])) {
        echo json_encode(['success' => false, 'message' => 'Product ID or Event ID is required']);
        exit;
    }
    
    $buyer_id = $data['buyer_id'];
    $product_id = isset($data['product_id']) ? $data['product_id'] : null;
    $event_id = isset($data['event_id']) ? $data['event_id'] : null;
    
    try {
        // Check if item is already in wishlist
        $check_query = "
            SELECT id FROM wishlist 
            WHERE buyer_id = ? AND (product_id = ? OR event_id = ?)
        ";
        $check_stmt = $conn->prepare($check_query);
        $check_stmt->bind_param("iii", $buyer_id, $product_id, $event_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'Item already in favorites']);
            exit;
        }
        
        // Add item to wishlist
        $insert_query = "
            INSERT INTO wishlist (buyer_id, product_id, event_id, created_at) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ";
        $stmt = $conn->prepare($insert_query);
        $stmt->bind_param("iii", $buyer_id, $product_id, $event_id);
        $stmt->execute();
        
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Added to favorites']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to add to favorites']);
        }
    } catch (Exception $e) {
        error_log("Error adding to favorites: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to add to favorites: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>