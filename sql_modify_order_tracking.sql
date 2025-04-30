-- Add seller_id to order_items to link each item to its seller
ALTER TABLE order_items
ADD COLUMN seller_id INT(11) AFTER order_id;

-- Update existing order_items with seller_id from products or events
UPDATE order_items oi
LEFT JOIN products p ON oi.product_id = p.id
LEFT JOIN events e ON oi.event_id = e.id
SET oi.seller_id = COALESCE(p.seller_id, e.seller_id);

-- Create order_item_status table to track status per order item (per seller)
CREATE TABLE order_item_status (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_item_id INT(11) NOT NULL,
  status ENUM('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
);

-- Optional: Drop status column from orders table if no longer needed
-- ALTER TABLE orders DROP COLUMN status;

-- Optional: Drop tracking table if replaced by order_item_status
-- DROP TABLE tracking;
