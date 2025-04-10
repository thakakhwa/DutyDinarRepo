<?php
// api/wishlist.php

require_once("config.php");

// Set headers for CORS if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Check if user is authenticated (you'll need to implement this based on your auth system)
// For example:
session_start();
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

if (!$user_id) {
    print_response(false, 'User not authenticated');
}

// GET request to fetch wishlist items
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $query = "
            SELECT w.id, w.buyer_id, 
                p.id as product_id, p.name as product_name, p.price as product_price, p.image_url as product_image,
                e.id as event_id, e.name as event_name, e.price as event_price, e.image_url as event_image
            FROM wishlist w
            LEFT JOIN products p ON w.product_id = p.id
            LEFT JOIN events e ON w.event_id = e.id
            WHERE w.buyer_id = ?
        ";
        
        $stmt = mysqli_prepare($conn, $query);
        mysqli_stmt_bind_param($stmt, "i", $user_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        $wishlistItems = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $item = [
                'id' => $row['id'],
                'buyer_id' => $row['buyer_id']
            ];
            
            // Item is either a product or an event
            if ($row['product_id']) {
                $item['type'] = 'product';
                $item['itemId'] = $row['product_id'];
                $item['name'] = $row['product_name'];
                $item['price'] = $row['product_price'];
                $item['image_url'] = $row['product_image'];
            } else {
                $item['type'] = 'event';
                $item['itemId'] = $row['event_id'];
                $item['name'] = $row['event_name'];
                $item['price'] = $row['event_price'];
                $item['image_url'] = $row['event_image'];
            }
            
            $wishlistItems[] = $item;
        }
        
        print_response(true, 'Wishlist fetched successfully', $wishlistItems);
    } catch (Exception $e) {
        error_log("Error fetching wishlist: " . $e->getMessage());
        print_response(false, 'Server error while fetching wishlist');
    }
}

// POST request to add item to wishlist
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get the raw POST data
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);
        
        if (!isset($data['type']) || ($data['type'] !== 'product' && $data['type'] !== 'event')) {
            print_response(false, 'Invalid item type');
        }
        
        if (!isset($data['itemId'])) {
            print_response(false, 'Item ID is required');
        }
        
        // Check if item already exists in wishlist
        if ($data['type'] === 'product') {
            $check_query = "SELECT id FROM wishlist WHERE buyer_id = ? AND product_id = ?";
            $stmt = mysqli_prepare($conn, $check_query);
            mysqli_stmt_bind_param($stmt, "ii", $user_id, $data['itemId']);
        } else {
            $check_query = "SELECT id FROM wishlist WHERE buyer_id = ? AND event_id = ?";
            $stmt = mysqli_prepare($conn, $check_query);
            mysqli_stmt_bind_param($stmt, "ii", $user_id, $data['itemId']);
        }
        
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (mysqli_num_rows($result) > 0) {
            $wishlist_item = mysqli_fetch_assoc($result);
            print_response(true, 'Item already in wishlist', ['id' => $wishlist_item['id']]);
        }
        
        // Add item to wishlist
        if ($data['type'] === 'product') {
            $insert_query = "INSERT INTO wishlist (buyer_id, product_id) VALUES (?, ?)";
            $stmt = mysqli_prepare($conn, $insert_query);
            mysqli_stmt_bind_param($stmt, "ii", $user_id, $data['itemId']);
        } else {
            $insert_query = "INSERT INTO wishlist (buyer_id, event_id) VALUES (?, ?)";
            $stmt = mysqli_prepare($conn, $insert_query);
            mysqli_stmt_bind_param($stmt, "ii", $user_id, $data['itemId']);
        }
        
        mysqli_stmt_execute($stmt);
        $wishlist_id = mysqli_insert_id($conn);
        
        print_response(true, 'Item added to wishlist', ['id' => $wishlist_id]);
    } catch (Exception $e) {
        error_log("Error adding to wishlist: " . $e->getMessage());
        print_response(false, 'Server error while adding to wishlist');
    }
}

// DELETE request to remove item from wishlist
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $wishlist_id = isset($_GET['id']) ? $_GET['id'] : null;
        
        if (!$wishlist_id) {
            print_response(false, 'Wishlist ID is required');
        }
        
        // Verify the item belongs to the user
        $check_query = "SELECT id FROM wishlist WHERE id = ? AND buyer_id = ?";
        $stmt = mysqli_prepare($conn, $check_query);
        mysqli_stmt_bind_param($stmt, "ii", $wishlist_id, $user_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (mysqli_num_rows($result) === 0) {
            print_response(false, 'Item not found in wishlist');
        }
        
        // Delete the item
        $delete_query = "DELETE FROM wishlist WHERE id = ?";
        $stmt = mysqli_prepare($conn, $delete_query);
        mysqli_stmt_bind_param($stmt, "i", $wishlist_id);
        mysqli_stmt_execute($stmt);
        
        print_response(true, 'Item removed from wishlist');
    } catch (Exception $e) {
        error_log("Error removing from wishlist: " . $e->getMessage());
        print_response(false, 'Server error while removing from wishlist');
    }
}

else {
    print_response(false, 'Method not allowed');
}
?>