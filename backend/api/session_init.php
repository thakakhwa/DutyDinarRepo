<?php
// Initialize session with proper cookie parameters for cross-origin requests
session_set_cookie_params(0, '/', 'localhost', false, true);
session_start();
?>
