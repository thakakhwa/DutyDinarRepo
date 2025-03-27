<?php
ini_set('logerrors', 1);  // Enable error logging
ini_set('error_log', __DIR__ . '/error_log.txt');  // Set the log file path

require_once("../controller/connection.php");
require_once("../controller/api_response.php");