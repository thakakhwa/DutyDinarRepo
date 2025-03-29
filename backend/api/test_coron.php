<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'CORS test successful']);
exit;