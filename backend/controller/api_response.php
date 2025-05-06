<?php
// this file helps us send responses back to frontend
// it creates json format responses that javascript can understand

// this function makes a standard response format for all our api
// input:
//   $success - true or false if request worked
//   $messsage - text message about what happened
//   $data - optional extra information to send (default is null)
// output:
//   sends json response and stops script
function print_response($success, $messsage, $data=null){
    // tell browser we are sending json data
    header('Content-Type: application/json');
    
    // make an array with our response data
    $body = ['success'=>$success, 'message' =>$messsage, 'data' =>$data];
    
    // convert array to json string
    $json_body = json_encode($body);
    
    // send response to browser
    echo $json_body;
    
    // stop script from running more code after response
    exit;
}
