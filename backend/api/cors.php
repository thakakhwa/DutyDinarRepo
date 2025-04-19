<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
<<<<<<< HEAD
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
=======
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Cache-Control");
>>>>>>> fixedbranchfsfs
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}
?>
