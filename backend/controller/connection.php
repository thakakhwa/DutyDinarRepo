<?php

// Database configuration
$hostname = "localhost";
$username = "root";
$password = "";
$database = "dutydinar";


// Create a database connection
$conn = mysqli_connect($hostname, $username, $password, $database);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
?>