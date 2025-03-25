<?php
$host = 'localhost';
$user = 'root';
$password = 'your_mysql_root_password'; // Replace with actual password
$database = 'dutydinar';
$port = 3306; // Default MySQL port
$socket = '/tmp/mysql.sock'; // Common socket path for MySQL on macOS

// Create connection
$conn = new mysqli($host, $user, $password, $database, $port, $socket);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}