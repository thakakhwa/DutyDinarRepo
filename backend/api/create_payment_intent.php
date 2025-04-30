<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
// Using default PHP error log, no custom path set

/*
ob_start();
*/

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/../../vendor/autoload.php';

\Stripe\Stripe::setApiKey('sk_test_51RJbVDQmRraBhPiij7EvE2uEbQzHEbwnnQ7EHTX25uDbYTv408qji8vUXBYjnUcNIDNN5POTHEzMZY2LvpVC7Eyw00zKU749SK');

header('Content-Type: application/json');

// Custom error handler to log PHP warnings/notices/errors
set_error_handler(function ($severity, $message, $file, $line) {
    error_log("PHP Error: [$severity] $message in $file on line $line");
    // Don't execute PHP internal error handler
    return true;
});

// Shutdown function to catch fatal errors and output JSON error response
register_shutdown_function(function () {
    $error = error_get_last();
    if ($error !== null) {
        http_response_code(500);
        /*
        ob_end_clean();
        */
        $message = $error['message'] ?? 'Fatal error';
        error_log("Fatal error caught in shutdown function: " . $message);
        echo json_encode(['error' => $message]);
        exit;
    }
});

try {
    $rawInput = file_get_contents('php://input');
    error_log("Raw input: " . $rawInput);
    $input = json_decode($rawInput, true);

    $amount = $input['amount'] ?? 0; // amount in cents
    $currency = $input['currency'] ?? 'usd';

    error_log("Creating PaymentIntent with amount: $amount, currency: $currency");
    $paymentIntent = \Stripe\PaymentIntent::create([
        'amount' => $amount,
        'currency' => $currency,
        'payment_method_types' => ['card'],
    ]);
    error_log("PaymentIntent created successfully");

    // Clear output buffer before sending JSON response
    ob_end_clean();
    echo json_encode(['clientSecret' => $paymentIntent->client_secret]);
} catch (Exception $e) {
    http_response_code(500);
    /*
    ob_end_clean();
    */
    error_log("Exception caught in create_payment_intent.php: " . $e->getMessage());
    echo json_encode([
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    exit;
}

/*
ob_end_flush();
*/
?>
