<?php
// api/favorites_remove.php - Remove item from favorites
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // For debugging
    error_log("Remove favorite request data: " . json_encode($data));
    
    if (!isset($data['id']) && (!isset($data['buyer_id']) || (!isset($data['product_id']) && !isset($data['event_id'])))) {
        echo json_encode(['success' => false, 'message' => 'Either favorite ID or buyer ID with product/event ID is required']);
        exit;
    }
    
    try {
        if (isset($data['id'])) {
            // Remove by wishlist ID
            $stmt = $conn->prepare("DELETE FROM wishlist WHERE id = ?");
            $stmt->bind_param("i", $data['id']);
        } else {
            // Remove by buyer_id and product_id/event_id
            $buyer_id = $data['buyer_id'];
            
            if (isset($data['product_id'])) {
                $stmt = $conn->prepare("DELETE FROM wishlist WHERE buyer_id = ? AND product_id = ?");
                $stmt->bind_param("ii", $buyer_id, $data['product_id']);
            } else {
                $stmt = $conn->prepare("DELETE FROM wishlist WHERE buyer_id = ? AND event_id = ?");
                $stmt->bind_param("ii", $buyer_id, $data['event_id']);
            }
        }
        
        $stmt->execute();
        
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Removed from favorites']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to remove from favorites or item not found']);
        }
    } catch (Exception $e) {
        error_log("Error removing from favorites: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to remove from favorites: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>