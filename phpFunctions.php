<?php

function get_url_variables()
{
	//set global scope
	global $LIMIT, $FLOOR, $site, $dataset, $con, $debug;
	
	if(isset($_GET['debug']))
	{
		if(strtoupper($_GET['debug']) == "TRUE" || strtoupper($_GET['debug']) == "T")
		$debug = TRUE;
	}

	if(isset($_GET['limit']))
	{
	
		$LIMIT = "LIMIT " . $_GET['limit'];

	}else
	{
		$LIMIT = "";
	}

	//database connectivity

	$con = mysql_connect("hwtest","jonathan","admin");
	if (!$con)
	{
		die('Could not connect: ' . mysql_error());
	}
	if($debug)
		echo "Connected!<br>";
	
	if(isset($_GET['site']))
	{
		$site=$_GET['site'];
		if($debug)
			echo "Site has been set to: ". $site;
		mysql_select_db($site, $con);
	}else
	{
		$site="amz_bfi1";
		//select the database
		mysql_select_db($site, $con);
		if($debug)
			echo "No Site selected.<br> Using default site<br>";
	}
	
	if(isset($_GET['dataset']))
	{
		$dataset=$_GET['dataset'];
	}else
	{
		$dataset="";
		if($debug)
			echo "No dataset selected.<br> Using default table<br>";
	}
	
	if(isset($_GET['floor']))
	{
		$FLOOR=$_GET['floor'];
	}else
	{
		$FLOOR="1";
		if($debug)
			echo "No dataset selected.<br> Using default table<br>";
	}
}

function get_all_data()
{
	global $LIMIT, $FLOOR, $site, $dataset, $con, $debug;
	global $aps_json, $raw_data, $roam_data, $channels_json, $datasets_json;
	global $roams, $cellCount, $cells, $aps, $datasets, $channels;
		
	if($debug)
		echo "Site=" . $site . "<br>";
				
	//select all Roams
	$starttime = microtime(true);
	$roams = mysql_query("SELECT * FROM roams where dataset_id=(SELECT data_id FROM datasets where name =\"{$dataset}\") and duration>1;");
	$endtime = microtime(true);
	$duration = $endtime - $starttime;
	$fieldCount = mysql_num_fields($roams);
	$rowCount = mysql_num_rows($roams);
	
	if($debug){
		echo "<b>Roams</b>";
		echo "<br>Total Fields: " . $fieldCount;
		echo "<br>Total Rows: " . $rowCount;
		echo "<br>Duration: " . number_format($duration, 2) . " ms";
		echo "<br>";
	}

	//select all cells
	$starttime = microtime(true);
	$counter = mysql_query("SELECT rssi_id from rssi where x>0 AND dataset_id = (SELECT data_id FROM datasets where name =\"{$dataset}\");");
	$cellCount = mysql_num_rows($counter);
	if($cellCount > 10000)
	{
		$FLOOR = $cellCount / 30000;
	}
	$query = "	SELECT A.rssi_id, A.x,A.y,A.rssi_val,avg(A.br_val),B.channel 
				FROM rssi A 
				INNER JOIN aps B ON A.ap_id = B.mac 
				WHERE A.x>0 AND dataset_id = 
				(SELECT data_id FROM datasets where name=\"{$dataset}\") 
				GROUP BY FLOOR(A.x/{$FLOOR}), FLOOR(A.y/{$FLOOR}), B.channel	{$LIMIT}";
	$cells = mysql_query($query);
	//$cells = mysql_query("SELECT cell_id, x, y, AVG(RSSI) as RSSI FROM cells GROUP BY x,y");
	$endtime = microtime(true);
	$duration = $endtime - $starttime;
	if($debug){
		echo "<b>Cells</b>";
		echo "Query: " . $query;
		echo "<br>Total Fields: " . mysql_num_fields($cells);
		echo "<br>Total Rows: " . mysql_num_rows($cells);
		echo "<br>Duration: " . number_format($duration, 2) . " ms";
		echo "<br>";
	}
	
	//get all APs
	$starttime = microtime(true);
	//$aps = mysql_query("SELECT ap_id, mac, DISTINCT(channel) FROM aps");
	$aps = mysql_query("SELECT * FROM aps where channel>0");
	$endtime = microtime(true);
	$duration = $endtime - $starttime;
	if($debug){
		echo "<b>APs</b>";
		echo "<br>Total Fields: " . mysql_num_fields($aps);
		echo "<br>Total Rows: " . mysql_num_rows($aps);
		echo "<br>Duration: " . number_format($duration, 2) . " ms";
		echo "<br>";
	}
	
	//get all Datasets
	$starttime = microtime(true);
	//$aps = mysql_query("SELECT ap_id, mac, DISTINCT(channel) FROM aps");
	$datasets = mysql_query("SELECT * FROM datasets");
	$endtime = microtime(true);
	$duration = $endtime - $starttime;
	if($debug){
		echo "<b>Datasets</b>";
		echo "<br>Total Fields: " . mysql_num_fields($datasets);
		echo "<br>Total Rows: " . mysql_num_rows($datasets);
		echo "<br>Duration: " . number_format($duration, 2) . " ms";
		echo "<br>";
	}
	
	//get all Channels
	
	$starttime = microtime(true);
	//$aps = mysql_query("SELECT ap_id, mac, DISTINCT(channel) FROM aps");
	$channels = mysql_query("SELECT * FROM aps");
	/*$channels = mysql_query("	SELECT B.channel as channel, 
								sum(A.record_count) as records, 
								sum(A.record_count)/(SELECT sum(record_count) from rssi2)*100 as percent,
								avg(A.rssi_val) as avg_rssi, 
								min(A.rssi_val) as min_rssi, 
								max(A.rssi_val) as max_rssi
								FROM amz_bfi1.rssi2 A
								INNER JOIN aps B on A.ap_id = B.ap_id
								WHERE B.channel != ''
								group by B.channel 
								order by sum(record_count) desc;");
								*/
	$endtime = microtime(true);
	$duration = $endtime - $starttime;
	if($debug){
		echo "<b>Channels</b>";
		echo "<br>Total Fields: " . mysql_num_fields($channels);
		echo "<br>Total Rows: " . mysql_num_rows($channels);
		echo "<br>Duration: " . number_format($duration, 2) . " ms";
		echo "<br>";
	}
	
	//get all Traffic
	/*
	$starttime = microtime(true);
	//$aps = mysql_query("SELECT ap_id, mac, DISTINCT(channel) FROM aps");
	$traffic = mysql_query("SELECT x,y,sum(record_count) as records, avg(rssi_val) as rssi_val FROM amz_bfi1.rssi group by x,y");
	$endtime = microtime(true);
	$duration = $endtime - $starttime;
	if($debug){
		echo "<b>Traffic</b>";
		echo "<br>Total Fields: " . mysql_num_fields($traffic);
		echo "<br>Total Rows: " . mysql_num_rows($traffic);
		echo "<br>Duration: " . number_format($duration, 2) . " ms";
		echo "<br>";
	}
	*/

	 if($debug)
	echo "Total Duration: " . number_format($duration, 2) . " ms<br>";
	
		
		
	//json encoding
	mysql_data_seek( $aps, 0);
	$aps_json = array();
	while($r = mysql_fetch_assoc($aps)) {
		$aps_json[] = $r;
	}

	mysql_data_seek( $channels, 0);
	$channels_json = array();
	while($r = mysql_fetch_assoc($channels)) {
		$channels_json[] = $r;
	}

	
	mysql_data_seek( $cells, 0);
	$raw_data = array();
	while($r = mysql_fetch_assoc($cells)) {
		$raw_data[] = $r;
	}

	mysql_data_seek( $datasets, 0);
	$datasets_json = array();
	while($r = mysql_fetch_assoc($datasets)) {
		$datasets_json[] = $r;
	}

	//mysql_data_seek( $roams, 0);
	$roam_data = array();
	while($r = mysql_fetch_assoc($roams)) {
		$roam_data[] = $r;
	}

	/*
	mysql_data_seek( $traffic, 0);
	$traffic_data = array();
	while($r = mysql_fetch_assoc($traffic)) {
		$traffic_data[] = $r;
	}
	*/
	
	
}

?>