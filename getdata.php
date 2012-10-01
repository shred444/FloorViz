<?php
$db=$_GET["db"];
$table=$_GET["table"];

$con = mysql_connect('hwtest', 'jonathan', 'admin');
if (!$con)
  {
  die('Could not connect: ' . mysql_error());
  }

mysql_select_db($db, $con);

$result = mysql_query("SELECT A.rssi_id,A.x,A.y,A.ap_id,A.rssi_val,aps.channel FROM {$table} A inner join aps ON A.ap_id = aps.ap_id");

	$json_data = array();
		while($r = mysql_fetch_assoc($result)) {
			$json_data[] = $r;
		}
echo json_encode($json_data);

mysql_close($con);
?>