ALTER TABLE payments MODIFY COLUMN payment_method ENUM('credit_card','paypal','bank_transfer','cash') NOT NULL;
