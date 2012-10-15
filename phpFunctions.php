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
		//no dataset chosen, so get the first one
		$result = mysql_query('SELECT name FROM datasets order by data_id asc limit 1');
		
		$dataset=mysql_result($result, 0,0);
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
		
	//get all roams (A->B)
	$myRoams = new php_query();
	$myRoams->name = "Roams";
	$myRoams->runQuery("SELECT * FROM roams where dataset_id=(SELECT data_id FROM datasets where name =\"{$dataset}\") and duration>1 AND origin_ap <> dest_ap;");
	$myRoams->createJSVar("rawData.roams");
	
	//get all roams (A->A)
	$mySingleRoams = new php_query();
	$mySingleRoams->name = "Single Roams";
	$mySingleRoams->runQuery("SELECT * FROM roams where dataset_id=(SELECT data_id FROM datasets where name =\"{$dataset}\") and duration>1 AND origin_ap = dest_ap;");
	$mySingleRoams->createJSVar("rawData.single");
	
	//count # of results
	/*$myCounter = new php_query();
	$myCounter->runQuery("SELECT rssi_id from rssi where x>0 AND dataset_id = (SELECT data_id FROM datasets where name =\"{$dataset}\")");
	if($myCounter->rowCount > 10000){
		$FLOOR = $myCounter->rowCount / 30000;
	}
	*/

	
	//get all cells
	$myCells = new php_query();
	$myCells->name = "Cells";
	$removedOutliers = "
	SELECT A.*, B.channel, dev.* 
	FROM rssi A
	JOIN ( 
		SELECT d.rssi_id, Avg(d.rssi_val) as average, {$STD}*STDDEV(d.rssi_val) StdDeviation
        FROM rssi d
		WHERE 
			x>0 AND
			dataset_id = (SELECT data_id FROM datasets where name=\"{$dataset}\")
		
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
		
	$myCells->createJSVar("rawData.rssi");
	
	//get all APs
	$myAPs = new php_query();
	$myAPs->name = "APs";
	$myAPs->runQuery("SELECT * FROM aps where channel>0");
	$myAPs->createJSVar("rawData.aps");
	
	//get all Datasets
	$myDatasets = new php_query();
	$myDatasets->name = "Datasets";
	$myDatasets->runQuery("SELECT * FROM datasets");
	$myDatasets->createJSVar("rawData.datasets");
		
	//get all Channels
	$myChannels = new php_query();
	$myChannels->name = "Channels";
	$myChannels->runQuery("SELECT * FROM aps");
	$myChannels->createJSVar("rawData.channels");
	
	//get RSSI histogram
	$myRSSIHist = new php_query();
	$myRSSIHist->name = "Histogram";
	//$myRSSIHist->runQuery("SELECT rssi_val, count(rssi_val) as count FROM rssi GROUP BY floor(rssi_val/((SELECT count(*) FROM rssi)/5));");
	$myRSSIHist->runQuery("
	SELECT rssi_val, count(rssi_val) as count FROM rssi
	WHERE dataset_id = (SELECT data_id FROM datasets where name=\"{$dataset}\") 
	GROUP BY floor(rssi_val/(SELECT max(rssi_val)-min(rssi_val) as diff from rssi) * 20)
	;");
	$myRSSIHist->createJSVar("rawData.hist");

}

?>