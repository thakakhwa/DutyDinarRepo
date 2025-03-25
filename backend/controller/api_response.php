<?php

function print_response($success, $messsage, $data=null){
    header('Content-Type: application/json');
    $body = ['success'=>$success, 'message' =>$messsage, 'data' =>$data];
    $json_body = json_encode($body);
    echo $json_body;
    exit;
}
