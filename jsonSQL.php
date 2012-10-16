<?php
	
include('classes.php');

$db=$_GET["db"];
$query=$_GET["q"];

$con = mysql_connect('hwtest', 'jonathan', 'admin');
if (!$con){
  die('Could not connect: ' . mysql_error());
}

mysql_select_db($db, $con);

$myQuery = new php_query();
$myQuery->runQuery($query);

echo json_encode($myQuery->JSON_data);


mysql_close($con);
?>