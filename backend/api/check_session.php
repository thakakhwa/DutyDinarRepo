<?php
session_start();

if (isset($_SESSION['user'])) {
    echo json_encode([
        'status' => true,
        'message' => 'User is logged in.',
        'data' => $_SESSION['user']
    ]);
} else {
    echo json_encode([
        'status' => false,
        'message' => 'User is not logged in.'
    ]);
}
?>
