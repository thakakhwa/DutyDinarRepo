<?php
// api/favorites_check.php - Check if item is in favorites
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['buyer_id'])) {
        echo json_encode(['success' => false, 'message' => 'Buyer ID is required']);
        exit;
    }
    
    if (!isset($_GET['product_id']) && !isset($_GET['event_id'])) {
        echo json_encode(['success' => false, 'message' => 'Product ID or Event ID is required']);
        exit;
    }
    
    $buyer_id = $_GET['buyer_id'];
    $product_id = isset($_GET['product_id']) ? $_GET['product_id'] : null;
    $event_id = isset($_GET['event_id']) ? $_GET['event_id'] : null;
    
    // For debugging
    error_log("Checking favorites for buyer_id: $buyer_id, product_id: $product_id, event_id: $event_id");
    
    try {
        $query = "
            SELECT id FROM wishlist 
            WHERE buyer_id = ? AND (product_id = ? OR event_id = ?)
        ";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("iii", $buyer_id, $product_id, $event_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $isFavorite = $result->num_rows > 0;
        error_log("Is in favorites: " . ($isFavorite ? "Yes" : "No"));
        
        echo json_encode(['success' => true, 'isFavorite' => $isFavorite]);
    } catch (Exception $e) {
        error_log("Error checking favorite status: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to check favorite status: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>