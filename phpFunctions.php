<?php

function get_url_variables()
{
	//set global scope
	global $LIMIT, $FLOOR, $site, $dataset, $con, $debug, $STD;
	
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
	
	if(isset($_GET['std']))
	{
		$STD=$_GET['std'];
		if($debug)
			echo "STD SET to " . $STD;
	}else
	{
		$STD=1.5;
		if($debug)
			echo "STD SET to " . $STD;
	}
}

function get_all_data()
{
	global $LIMIT, $FLOOR, $site, $dataset, $con, $debug, $STD;
	global $aps_json, $raw_data, $roam_data, $channels_json, $datasets_json;
	global $myRoams, $myCount, $myCells, $myAPs, $myDatasets, $myChannels;
	
	
	if($debug)
		echo "Site=" . $site . "<br>";
		
	//get all roams
	$myRoams = new php_query();
	$myRoams->runQuery("SELECT * FROM roams where dataset_id=(SELECT data_id FROM datasets where name =\"{$dataset}\") and duration>1;");
	$roam_data = $myRoams->JSON_data;
	$myRoams->createJSVar("rawData.roams");
	
	//count # of results
	$myCounter = new php_query();
	$myCounter->runQuery("SELECT rssi_id from rssi where x>0 AND dataset_id = (SELECT data_id FROM datasets where name =\"{$dataset}\")");
	if($myCounter->rowCount > 10000){
		$FLOOR = $myCounter->rowCount / 30000;
	}
	

	
	//get all cells
	$myCells = new php_query();
	
	$removedOutliers = "
	SELECT A.*, B.channel, dev.* 
	FROM rssi A
	JOIN ( 
		SELECT d.rssi_id, Avg(d.rssi_val) as average, {$STD}*STDDEV(d.rssi_val) StdDeviation
        FROM rssi d
		WHERE x>0
         ) dev
	INNER JOIN aps B ON A.ap_id = B.mac
	WHERE
		A.x>0 AND
		A.rssi_val BETWEEN dev.average-dev.StdDeviation AND dev.average+dev.StdDeviation AND
		dataset_id = (SELECT data_id FROM datasets where name=\"{$dataset}\")
		GROUP BY FLOOR(A.x/{$FLOOR}), FLOOR(A.y/{$FLOOR}), B.channel
		{$LIMIT}";
	
	$allowOutliers="
	SELECT A.*,B.channel
	FROM rssi A 
	INNER JOIN aps B ON A.ap_id = B.mac 
	WHERE A.x>0 AND dataset_id = (SELECT data_id FROM datasets where name=\"{$dataset}\") 
	GROUP BY FLOOR(A.x/{$FLOOR}), FLOOR(A.y/{$FLOOR}), B.channel
	{$LIMIT}";		
	
	$myCells->runQuery($removedOutliers);
		
	$raw_data = $myCells->JSON_data;
	$myCells->createJSVar("rawData.rssi");
	
	//get all APs
	$myAPs = new php_query();
	$myAPs->runQuery("SELECT * FROM aps where channel>0");
	$aps_json = $myAPs->JSON_data;
	$myAPs->createJSVar("rawData.aps");
	
	//get all Datasets
	$myDatasets = new php_query();
	$myDatasets->runQuery("SELECT * FROM datasets");
	$datasets_json = $myDatasets->JSON_data;
	$myDatasets->createJSVar("rawData.datasets");
		
	//get all Channels
	$myChannels = new php_query();
	$myChannels->runQuery("SELECT * FROM aps");
	$channels_json = $myChannels->JSON_data;
	$myChannels->createJSVar("rawData.channels");
	
	//get RSSI histogram
	$myRSSIHist = new php_query();
	$myRSSIHist->runQuery("SELECT rssi_val, count(rssi_val) as count FROM rssi GROUP BY floor(rssi_val/5);");
	$rssiHist_json = $myRSSIHist->JSON_data;
	$myRSSIHist->createJSVar("rawData.hist");

}

?>