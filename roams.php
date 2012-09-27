<html>
	<head>
	
	<script src="http://d3js.org/d3.v2.js"></script>
	
		<?php //database connectivity
		
			$con = mysql_connect("hwtest","jonathan","admin");
			if (!$con)
			{
				die('Could not connect: ' . mysql_error());
			}
			echo "Connected!<br>";
			// some code
			
			if(isset($_GET['s']))
			{
				$site=$_GET['s'];
				mysql_select_db($site, $con);
			}else
			{
				$site="amz_bfi1";
				echo "No Site selected.<br> Using default site<br>";
			}
			
			
			//select the database
			mysql_select_db($site, $con);
			echo "Site=" . $site . "<br>";
						
			//create the query
			$starttime = microtime(true);
			$roams = mysql_query("SELECT * FROM roams");
			$endtime = microtime(true);
			$duration = $endtime - $starttime;
			$fieldCount = mysql_num_fields($roams);
			$rowCount = mysql_num_rows($roams);
		
			echo "<br>Total Fields: " . $fieldCount;
			echo "<br>Total Rows: " . $rowCount;
			echo "<br>Duration: " . number_format($duration, 2) . " ms";
			echo "<br>";
		
			$starttime = microtime(true);
			$cells = mysql_query("SELECT * FROM cells");
			//$cells = mysql_query("SELECT cell_id, x, y, AVG(RSSI) as RSSI FROM cells GROUP BY x,y");
			$endtime = microtime(true);
			$duration = $endtime - $starttime;
			echo "<br>Total Fields: " . mysql_num_fields($cells);
			echo "<br>Total Rows: " . mysql_num_rows($cells);
			echo "<br>Duration: " . number_format($duration, 2) . " ms";
			echo "<br>";
			
			//get all APs
			$starttime = microtime(true);
			$aps = mysql_query("SELECT * FROM aps");
			$endtime = microtime(true);
			$duration = $endtime - $starttime;
			echo "<br>Total Fields: " . mysql_num_fields($aps);
			echo "<br>Total Rows: " . mysql_num_rows($aps);
			echo "<br>Duration: " . number_format($duration, 2) . " ms";
			echo "<br>";
		
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
					echo "rssiset.push([{$rssi_results['x']}, {$rssi_results['y']}, {$rssi_results['rssi_val']}, {$rssi_results['ap_id']}]);
					";
				
				}
			}
			$endtime = microtime(true);
			$duration = $endtime - $starttime;
		?>
		</script>
		Total Duration: <?php echo number_format($duration, 2) . " ms<br>"; ?>
			
		<?php
		
		mysql_close($con);
		
		
		?>
		
		</head>
		<body>
		
		<svg id="visualization" width="1200" height="600"></svg>
		<form id="controls" style="float:right">
			<div>
				<ul style="list-style-type:none">
					<li>
						<select id="dataset">
							<option value="amz_bfi1">Amazon - BFI1</option>
							<option selected="selected" value="quid_gou">Quid_GOU</option>
							<option value="gap_bol">Gap_bol</option>
						</select>
					</li>
					<li>
						<input type="checkbox" checked="checked" value="roams">Roams
					</li>
					<li>
						<input type="checkbox" checked="checked" value="pings">Pings
					</li>
					<li>
						<input type="checkbox" checked="checked" value="rssi">RSSI
					</li>
				</ul>
				<ul style="list-style-type:none">
					<?php
					mysql_data_seek( $aps, 0);
					while($row = mysql_fetch_array($aps))
					{ ?>
						<li>
							<input type="checkbox" checked="checked" value="<?php echo $row['mac']?>"><?php echo $row['mac']?>
						</li>
						
					<?php 
					} ?>
					
				</ul>
			</div>
		</form>
		
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
				var rssi = {$row['RSSI']};
				cellset.push([xPos, yPos, rssi]);
				";
			}
			
			
			
			
			?>
		</script>
		
		
		<script src="roams.js"></script>
			</body>
		</html>		