<?php
// this is the database connection file
// it connects our code to the mysql database where all data is stored

// these are the settings for our database
// you need to change these if you use different database
$hostname = "localhost"; // the computer where database is running
$username = "root";      // the username for database login
$password = "";          // the password for database login (empty for local development)
$database = "dutydinar";  // the name of our database


// this line connects to the database using the settings above
// input: hostname, username, password, database name
// output: a connection that we can use to talk to database
$conn = mysqli_connect($hostname, $username, $password, $database);

// check if connection worked
if (!$conn) {
    // if connection failed, stop program and show error
    die("Connection failed: " . mysqli_connect_error());
}
?>