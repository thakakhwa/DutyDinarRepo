<?php
// api/favorites.php - Get all favorites for a user
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

    $buyer_id = $_GET['buyer_id'];
    
    // For debugging
    error_log("Fetching favorites for buyer_id: " . $buyer_id);
    
    try {
        $query = "
            SELECT w.*, p.name, p.description, p.price, p.image_url, p.category, 
                   e.name as event_name, e.description as event_description, 
                   e.price as event_price, e.image_url as event_image_url 
            FROM wishlist w
            LEFT JOIN products p ON w.product_id = p.id
            LEFT JOIN events e ON w.event_id = e.id
            WHERE w.buyer_id = ?
        ";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $buyer_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $favorites = [];
        while ($row = $result->fetch_assoc()) {
            // For debugging
            error_log("Found favorite item: " . json_encode($row));
            
            // Choose name and other details based on whether it's a product or event
            $name = $row['product_id'] ? $row['name'] : $row['event_name'];
            $description = $row['product_id'] ? $row['description'] : $row['event_description'];
            $price = $row['product_id'] ? $row['price'] : $row['event_price'];
            $image_url = $row['product_id'] ? $row['image_url'] : $row['event_image_url'];
            
            $favorites[] = [
                'id' => $row['id'],
                'buyer_id' => $row['buyer_id'],
                'product_id' => $row['product_id'],
                'event_id' => $row['event_id'],
                'name' => $name,
                'description' => $description,
                'price' => $price,
                'image_url' => $image_url,
                'category' => $row['category'],
                'created_at' => $row['created_at']
            ];
        }
        
        error_log("Total favorites found: " . count($favorites));
        echo json_encode(['success' => true, 'favorites' => $favorites]);
    } catch (Exception $e) {
        error_log("Error fetching favorites: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to fetch favorites: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>