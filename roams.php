<html>
	<head>
	<LINK href="styles.css" rel="stylesheet" type="text/css">
	<LINK href="barstyles.css" rel="stylesheet" type="text/css">
	
	<link href="jquery-ui-1.9.0.custom/css/smoothness/jquery-ui-1.9.0.custom.css" rel="stylesheet">
	<script src="jquery-ui-1.9.0.custom/js/jquery-1.8.2.js"></script>
	<script src="jquery-ui-1.9.0.custom/js/jquery-ui-1.9.0.custom.js"></script>
	<script src="http://d3js.org/d3.v2.js"></script>
	<script type="text/javascript">
	
	$(function() {
		
		$( "#accordion" ).accordion();
		

		
		var availableTags = [
			"ActionScript",
			"AppleScript",
			"Asp",
			"BASIC",
			"C",
			"C++",
			"Clojure",
			"COBOL",
			"ColdFusion",
			"Erlang",
			"Fortran",
			"Groovy",
			"Haskell",
			"Java",
			"JavaScript",
			"Lisp",
			"Perl",
			"PHP",
			"Python",
			"Ruby",
			"Scala",
			"Scheme"
		];
		$( "#autocomplete" ).autocomplete({
			source: availableTags
		});
		

		
		$( "#button" ).button();
		$( "#radioset" ).buttonset();
		

		
		$( "#tabs" ).tabs();
		

		
		$( "#dialog" ).dialog({
			autoOpen: false,
			width: 400,
			buttons: [
				{
					text: "Ok",
					click: function() {
						$( this ).dialog( "close" );
					}
				},
				{
					text: "Cancel",
					click: function() {
						$( this ).dialog( "close" );
					}
				}
			]
		});

		// Link to open the dialog
		$( "#dialog-link" ).click(function( event ) {
			$( "#dialog" ).dialog( "open" );
			event.preventDefault();
		});
		

		
		$( "#datepicker" ).datepicker({
			inline: true
		});
		

		
		$( "#slider" ).slider({
			range: true,
			values: [ 17, 67 ]
		});
		

		
		$( "#progressbar" ).progressbar({
			value: 20
		});
		

		// Hover states on the static widgets
		$( "#dialog-link, #icons li" ).hover(
			function() {
				$( this ).addClass( "ui-state-hover" );
			},
			function() {
				$( this ).removeClass( "ui-state-hover" );
			}
		);
	});
	
		
		
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
	
	<style>
	body{
		font: 62.5% "Trebuchet MS", sans-serif;
		margin: 50px;
	}
	.demoHeaders {
		margin-top: 2em;
	}
	#dialog-link {
		padding: .4em 1em .4em 20px;
		text-decoration: none;
		position: relative;
	}
	#dialog-link span.ui-icon {
		margin: 0 5px 0 0;
		position: absolute;
		left: .2em;
		top: 50%;
		margin-top: -8px;
	}
	#icons {
		margin: 0;
		padding: 0;
	}
	#icons li {
		margin: 2px;
		position: relative;
		padding: 4px 0;
		cursor: pointer;
		float: left;
		list-style: none;
	}
	#icons span.ui-icon {
		float: left;
		margin: 0 4px;
	}
	</style>
	<script>rawData = new Object(); </script>	
		<?php
		
			include('phpFunctions.php');
			include('classes.php');
			$databases = array("quid_gou","amz_bfi1","hwmhs","amazon_qa");
			
			//get all the variables from the URL bar
			get_url_variables();
			
			//query database for data and store in globals
			get_all_data();
			
			?>
		
		<script>
			
			var datasets = new Array();
			var floor = '<?php echo $FLOOR; ?>';
			var selectedDataset = '<?php echo $dataset; ?>';
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
							<?php foreach ($databases as $db){ ?>
								<option  <?php if($site == $db) echo "selected='selected'"; ?> value="<?php echo $db ?>"><?php echo $db ?></option>
							<?php }?>
														
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
					<div id="radioset" name="dataColumn" >
						<input type="radio" id="radio1" name="rssi_val" checked="checked" ><label for="radio1">RSSI</label>
						<input type="radio" id="radio2" name="br_val" ><label for="radio2">Bitrate</label>
						<input type="radio" id="radio3" name="record_count" ><label for="radio3">Traffic</label>
					</div>
					</li>
					
					<li>
						<select id="dataColumn" name="dataColumn" onchange="update()">
							<option value="rssi_val">RSSI</option>
							<option value="br_val">Bitrate</option>
							<option value="record_count">Traffic</option>
							
						</select>
					</li>
					<li>
						<input type="checkbox" onchange="update()" checked="checked" value="roams" id="roam-checkbox">roams
						<ul>
							<li>
								<input type="checkbox" onchange="update()" checked="checked" value="AtoB" id="AtoB-checkbox">A->B
							</li>
							<li>
								<input type="checkbox" onchange="update()" checked="checked" value="AtoA" id="AtoA-checkbox">A->A
							</li>
						</ul>
					</li>
					
					<li>
						<input type="checkbox" onchange="update()" checked="checked" value="timeouts" id="timeout-checkbox">timeouts
						<ul>
							<li>
								<input type="checkbox" onchange="update()" checked="checked" value="ping" id="ping-checkbox">Ping Failed
							</li>
							<li>
								<input type="checkbox" onchange="update()" checked="checked" value="fatalcomms" id="fatalcomms-checkbox">Fatal Comms
							</li>
						</ul>
					</li>

					
				</ul>
				<div id="dataDetails"></div>
				<h2>Channels</h2>
				<ul style="list-style-type:none">
					<?php
					mysql_data_seek( $myChannels->result, 0);
					while($row = mysql_fetch_array($myChannels->result))
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
					mysql_data_seek( $myAPs->result, 0);
					while($row = mysql_fetch_array($myAPs->result))
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

	
		</script>
		
		<div id="txtHint"></div>
		<div id="chart"></div>
		
		<script src="statistics.js"></script>
		<script src="roams.js"></script>
		<script src="histogram.js"></script>
		<script src="bar.js"></script>
		
		
		
			</body>
		</html>		