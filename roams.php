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
		
			include('phpFunctions.php');
			$databases = array("quid_gou","amz_bfi1","hwmhs","amazon_qa");
			
			//get all the variables from the URL bar
			get_url_variables();
			
			//query database for data and store in globals
			get_all_data();
			
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
			
			var datasets = new Array();
			<?php
			
			foreach ($databases as $db)
			{
				echo "var temp = new Array();";
				$result = mysql_query("SELECT * FROM {$db}.datasets");
				while($r = mysql_fetch_assoc($result)) {
					echo "temp.push('{$r['name']}');";
				}
				echo "datasets['{$db}'] = temp;";
			}
			?>
			
 
			
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
						<select id="site" name="site" onchange="populateDatasets('facility')">
							<option  <?php if($site == "amz_bfi1") echo "selected='selected'"; ?> value="amz_bfi1">Amazon - BFI1</option>
							<option  <?php if($site == "quid_gou") echo "selected='selected'"; ?> value="quid_gou">Quidsi - Diapers.com</option>
							<option  <?php if($site == "amazon_qa") echo "selected='selected'"; ?> value="amazon_qa">Amazon - QA</option>
							<option  <?php if($site == "hwmhs") echo "selected='selected'"; ?> value="hwmhs">Kiva - HWMHS</option>
							
						</select>
					</li>
					<li>
						<select id="dataset" name="dataset">
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
						<input type="checkbox" onchange="update()" checked="checked" disabled value="pings">Pings
					</li>
					<li>
						<input type="checkbox" onchange="update()" checked="checked" disabled value="rssi">RSSI
					</li>
					<li>
						<input type="checkbox" onchange="update()" checked="checked" disabled value="traffic">Traffic
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
		<script src="statistics.js"></script>
		<script src="roams.js"></script>
		<script src="bar.js"></script>
		
		
		
			</body>
		</html>		