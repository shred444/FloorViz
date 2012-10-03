<html>
	<head>
	<LINK href="styles.css" rel="stylesheet" type="text/css">
	<script src="http://d3js.org/d3.v2.js"></script>
	<script type="text/javascript">
	function pullNewData(db, table)
	{
		if (window.XMLHttpRequest)
		{// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp=new XMLHttpRequest();
		}
		else
		{// code for IE6, IE5
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
		
		xmlhttp.onreadystatechange=function()
		{
			//alert("received" + xmlhttp.readyState + "  " + xmlhttp.status);
			if (xmlhttp.readyState==4 && xmlhttp.status==200)
			{
				//data has been received from ajax function
				//document.getElementById("txtHint").innerHTML=xmlhttp.responseText;
				
								
				rawData.rssi=JSON.parse(xmlhttp.responseText);
				update();
		
			}
		}
		
		//get selected table and db from html form
		var myDB = document.getElementById("dataset").value;
		var myTable = document.getElementById("tableSelector").value;
		
		//send ajax to getdata
		xmlhttp.open("GET","getdata.php?db=" + myDB + "&table=" + myTable,true);
		xmlhttp.send();
	}
	</script>
		<?php
		
			//debugging
			$debug = FALSE;
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
			
			if(isset($_GET['s']))
			{
				$site=$_GET['s'];
				mysql_select_db($site, $con);
			}else
			{
				$site="amz_bfi1";
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
			
			
			
			//select the database
			mysql_select_db($site, $con);
			if($debug)
				echo "Site=" . $site . "<br>";
						
			//create the query
			$starttime = microtime(true);
			$roams = mysql_query("SELECT * FROM roams");
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
			$query = "SELECT A.rssi_id, A.x,A.y,A.rssi_val,avg(A.br_val),B.channel FROM rssi A inner join aps B ON A.ap_id = B.mac WHERE A.x>0 AND dataset_id = (SELECT data_id FROM datasets where name=\"{$dataset}\") 
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
		
			?>
			
		<?php if($debug)
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
			$raw_data[] = $r;
		}
		
		//mysql_data_seek( $roams, 0);
		$roam_data = array();
		/*while($r = mysql_fetch_assoc($roams)) {
			$roam_data[] = $r;
		}
		*/
		/*
		mysql_data_seek( $traffic, 0);
		$traffic_data = array();
		while($r = mysql_fetch_assoc($traffic)) {
			$traffic_data[] = $r;
		}
		*/
		?>
		
		<script>
			//define json variables for use later
			var jsonAPs=<?php echo json_encode($aps_json); ?>;
			//var jsonChannels=<?php echo json_encode($channels_json); ?>;
			rawData = new Object();
			rawData.rssi=<?php echo json_encode($raw_data); ?>;
			rawData.roams=<?php echo json_encode($roam_data); ?>;
			rawData.aps=<?php echo json_encode($aps_json); ?>;
			rawData.channels=<?php echo json_encode($channels_json); ?>;
			rawData.datasets=<?php echo json_encode($datasets_json); ?>;
			var floor = <?php echo $FLOOR; ?>
		</script>
		
		<?php
		
		mysql_close($con);
		
		
		?>
		
		</head>
		<body>
		<div id="header">
		<form id="facility" action="roams.php" method="get">
				
				<ul style="list-style-type:none">
					<li id="logo">
						Facility:
					</li>
					<li>
						<select id="dataset" name="s">
							<option  <?php if($site == "amz_bfi1") echo "selected='selected'"; ?> value="amz_bfi1">Amazon - BFI1</option>
							<option  <?php if($site == "quid_gou") echo "selected='selected'"; ?> value="quid_gou">Quidsi - Diapers.com</option>
							
						</select>
					</li>
					<li>
						<select id="tableSelector" name="dataset">
						<?php
							mysql_data_seek( $datasets, 0);
							while($row = mysql_fetch_array($datasets))
							{ ?>
								<option <?php if($dataset == $row['name']) echo "selected='selected'"; ?> value="<?php echo $row['name']; ?>"><?php echo $row['name']; ?></option>
							<?php }?>
						</select>
					</li>
					<li>
						<input type="submit" value="Refresh"> 
					</li>
					
					
					
					
				</ul>
			</form>
		</div>
		<svg id="visualization" width="1000" height="500"></svg>
		
		<div id="sidebar">
			<form id="controls" method="get">
				<h2>Details</h2>
				<ul style="list-style-type:none">
					
					<li>
						<input type="checkbox" onchange="update()" checked="checked" value="roams" id="roams">roams
					</li>
					<li>
						<input type="checkbox" onchange="update()" checked="checked" value="pings">Pings
					</li>
					<li>
						<input type="checkbox" onchange="update()" checked="checked" value="rssi">RSSI
					</li>
					<li>
						<input type="checkbox" onchange="update()" checked="checked" value="traffic">Traffic
					</li>
					
					
					
				</ul>
				<div id="dataDetails"></div>
				<h2>Channels</h2>
				<ul style="list-style-type:none">
					<?php
					mysql_data_seek( $channels, 0);
					while($row = mysql_fetch_array($channels))
					{ ?>
						<li>
						<label id="label-<?php echo $row['channel']?>">
							<input type="checkbox" checked onchange="update()" value="<?php echo $row['channel']?>" id="channel-<?php echo $row['channel']?>"><?php echo $row['channel']?> - <?php echo $row['mac']?>
						</label>
						</li>
						
					<?php 
					} ?>
					
				</ul>
				
				<h2>Access Points</h2>
				<ul style="list-style-type:none">
					<?php
					mysql_data_seek( $aps, 0);
					while($row = mysql_fetch_array($aps))
					{ ?>
						<li>
						<label id="<?php echo $row['mac']?>">
							<input type="checkbox" checked="checked" disabled value="<?php echo $row['mac']?>"><?php echo $row['mac']?>
						</label>
						</li>
						
					<?php 
					} ?>
					
				</ul>
				
			</form>
			
			
		</div>
		<script>
			//Dynamic, random dataset
			var dataset = [];					//Initialize empty array
			var cellset = [];
			//var rssiset = [[],[]];
			var numDataPoints = 50;				//Number of dummy data points to create
			var xRange = Math.random() * 1000;	//Max range of new x values
			var yRange = Math.random() * 1000;	//Max range of new y values
			
			<?php
			/*
			mysql_data_seek( $roams, 0);
			while($row = mysql_fetch_array($roams)){
				//add data points from db
				echo "
				var xPos = {$row['x']};
				var yPos = {$row['y']};
				var radius = 10;
				dataset.push([xPos, yPos, radius]);
				";
			}
			*/
			mysql_data_seek( $cells, 0);
			while($row = mysql_fetch_array($cells)){
				//add data points from db
				echo "
				var xPos = {$row['x']};
				var yPos = {$row['y']};
				var rssi = {$row['rssi_val']};
				cellset.push([xPos, yPos, rssi]);
				";
			}
			
			
			
			
			?>
		</script>
		
		<div id="txtHint"></div>
		
		<svg class="barchart" id="barchart" width="500" height="300"></svg>
		
		<script src="roams.js"></script>
		<script src="bar.js"></script>
		
		
		
			</body>
		</html>		