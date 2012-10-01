<html>
	<head>
	
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
			$cells = mysql_query("SELECT A.rssi_id,A.x,A.y,A.ap_id,A.rssi_val,aps.channel FROM rssi A inner join aps ON A.ap_id = aps.ap_id");
			//$cells = mysql_query("SELECT cell_id, x, y, AVG(RSSI) as RSSI FROM cells GROUP BY x,y");
			$endtime = microtime(true);
			$duration = $endtime - $starttime;
			if($debug){
				echo "<b>Cells</b>";
				echo "<br>Total Fields: " . mysql_num_fields($cells);
				echo "<br>Total Rows: " . mysql_num_rows($cells);
				echo "<br>Duration: " . number_format($duration, 2) . " ms";
				echo "<br>";
			}
			
			//get all APs
			$starttime = microtime(true);
			//$aps = mysql_query("SELECT ap_id, mac, DISTINCT(channel) FROM aps");
			$aps = mysql_query("SELECT * FROM aps");
			$endtime = microtime(true);
			$duration = $endtime - $starttime;
			if($debug){
				echo "<b>APs</b>";
				echo "<br>Total Fields: " . mysql_num_fields($aps);
				echo "<br>Total Rows: " . mysql_num_rows($aps);
				echo "<br>Duration: " . number_format($duration, 2) . " ms";
				echo "<br>";
			}
			
			//get all Channels
			$starttime = microtime(true);
			//$aps = mysql_query("SELECT ap_id, mac, DISTINCT(channel) FROM aps");
			$channels = mysql_query("SELECT DISTINCT(channel) FROM aps WHERE channel !='';");
			$endtime = microtime(true);
			$duration = $endtime - $starttime;
			if($debug){
				echo "<b>Channels</b>";
				echo "<br>Total Fields: " . mysql_num_fields($channels);
				echo "<br>Total Rows: " . mysql_num_rows($channels);
				echo "<br>Duration: " . number_format($duration, 2) . " ms";
				echo "<br>";
			}
			
		
			?>
			<script>
			var rssiset = [];
			<?php
			//get data for each ap
			$starttime = microtime(true);
			mysql_data_seek( $aps, 0);
			while($row = mysql_fetch_array($aps))
			{
				
				$rssi_per_ap = mysql_query("SELECT * FROM rssi WHERE ap_id=" . $row['ap_id']);
				
							
				while($rssi_results = mysql_fetch_array($rssi_per_ap))
				{ 
					echo "rssiset.push([{$rssi_results['x']}, {$rssi_results['y']}, {$rssi_results['rssi_val']}, {$rssi_results['ap_id']}, {$row['channel']}]);
					";
				
				}
			}
			
			
			$endtime = microtime(true);
			$duration = $endtime - $starttime;
		?>
		</script>
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
		
		mysql_data_seek( $roams, 0);
		$roam_data = array();
		while($r = mysql_fetch_assoc($roams)) {
			$roam_data[] = $r;
		}
		
		?>
		
		<script>
			//define json variables for use later
			var jsonAPs=<?php echo json_encode($aps_json); ?>;
			var jsonChannels=<?php echo json_encode($channels_json); ?>;
			rawData = new Object();
			rawData.rssi=<?php echo json_encode($raw_data); ?>;
			rawData.roams=<?php echo json_encode($roam_data); ?>;
			rawData.aps=<?php echo json_encode($aps_json); ?>;
			rawData.channels=<?php echo json_encode($channels_json); ?>;
		</script>
		
		<?php
		
		mysql_close($con);
		
		
		?>
		
		</head>
		<body>
		
		<svg id="visualization" width="1200" height="600"></svg>
		
		<div style="float:right; padding-right:50px; background-color: #DDDDDD;">
			<form id="controls">
				<h2>Facility</h2>
				<ul style="list-style-type:none">
					<li>
						<select id="dataset" onchange="pullNewData('amz_bfi1',this.value)">
							<option selected="selected" value="amz_bfi1">Amazon - BFI1</option>
							
						</select>
					</li>
					<li>
						<select id="tableSelector" onchange="pullNewData('amz_bfi1',this.value)">
							<option selected="selected" value="rssi">rssi</option>
							<option value="rssi2">rssi2</option>
						</select>
					</li>
					
					<li>
						<input type="checkbox" onchange="update()" checked="checked" value="roams" id="roams">roams
					</li>
					<li>
						<input type="checkbox" onchange="update()" checked="checked" value="pings">Pings
					</li>
					<li>
						<input type="checkbox" onchange="update()" checked="checked" value="rssi">RSSI
					</li>
					
				</ul>
				
				<h2>Channels</h2>
				<ul style="list-style-type:none">
					<?php
					mysql_data_seek( $channels, 0);
					while($row = mysql_fetch_array($channels))
					{ ?>
						<li>
						<label id="label-<?php echo $row['channel']?>">
							<input type="checkbox" onchange="update()" checked="checked" value="<?php echo $row['channel']?>" id="channel-<?php echo $row['channel']?>"><?php echo $row['channel']?>
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
						<label id="<?php echo $row['ap_id']?>">
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
		
		
		<script src="roams.js"></script>
		
		
		
			</body>
		</html>		