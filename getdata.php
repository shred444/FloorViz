<?php
$db=$_GET["db"];

$con = mysql_connect('hwtest', 'jonathan', 'admin');
if (!$con)
  {
  die('Could not connect: ' . mysql_error());
  }

mysql_select_db("amz_bfi1", $con);

$sql="SELECT * FROM " . $db;

$result = mysql_query($sql);

	$json_data = array();
		while($r = mysql_fetch_assoc($result)) {
			$json_data[] = $r;
		}
echo json_encode($json_data);


/*
echo "<table border='1'>
<tr>
<th>Firstname</th>
<th>Lastname</th>
<th>Age</th>
<th>Hometown</th>
<th>Job</th>
</tr>";

while($row = mysql_fetch_array($result))
  {
  echo "<tr>";
  echo "<td>" . $row['rssi_id'] . "</td>";
  //echo "<td>" . $row['LastName'] . "</td>";
  //echo "<td>" . $row['Age'] . "</td>";
  //echo "<td>" . $row['Hometown'] . "</td>";
  //echo "<td>" . $row['Job'] . "</td>";
  echo "</tr>";
  }
echo "</table>";
*/
mysql_close($con);
?>