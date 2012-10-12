<script>
	var rawData = new Object();
</script>

<?php
	//get all cells
	
	include('phpFunctions.php');
	include('classes.php');
		
	get_url_variables();
	$debug='t';
	$dataset="Oct10";
	$site="amz_bfi1";
	
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
	
	$myCells = new php_query();
	
	
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
	
?>