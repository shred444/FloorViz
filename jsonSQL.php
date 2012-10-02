<?php
$db=$_GET["db"];
$query=$_GET["q"];
//echo $query;
//$query="SELECT * FROM aps";

$con = mysql_connect('hwtest', 'jonathan', 'admin');
if (!$con)
  {
  die('Could not connect: ' . mysql_error());
  }

mysql_select_db($db, $con);

$result = mysql_query($query);

$json_data = array();

/*while($r = mysql_fetch_assoc($result)) {
	$json_data[] = $r;
}
echo json_encode($json_data);
*/

while($r = mysql_fetch_assoc($result)) {
	if(!isset($google_JSON)){    
     $google_JSON = "{cols: [";    
     $column = array_keys($r);
     foreach($column as $key=>$value){
         $google_JSON_cols[]="{id: '".$key."', label: '".$value."'}";
     }    
     $google_JSON .= implode(",",$google_JSON_cols)."],rows: [";       
   }
   $google_JSON_rows[] = "{c:[{v: '".$r['ap_id']."'}, {v: ".$r['mac']."}, {v: ".$r['channel']."}]}";
}    
// you may need to change the above into a function that loops through rows, with $r['id'] etc, referring to the fields you want to inject..
echo $google_JSON.implode(",",$google_JSON_rows)."]}";

mysql_close($con);
?>