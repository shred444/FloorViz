<html>
	<head>
	<LINK href="styles.css" rel="stylesheet" type="text/css">
	<LINK href="barstyles.css" rel="stylesheet" type="text/css">
	<LINK href="piestyles.css" rel="stylesheet" type="text/css">
	<LINK href="timepicker.css" rel="stylesheet" type="text/css">
	<link href="jquery-ui-1.9.0.custom/css/smoothness/jquery-ui-1.9.0.custom.css" rel="stylesheet">
	
	<script src="http://code.jquery.com/jquery-1.8.2.js"></script>
	<script src="http://code.jquery.com/ui/1.9.0/jquery-ui.js"></script>
	
	<script src="http://d3js.org/d3.v3.min.js"></script>
	<script type="text/javascript" src="jquery-ui-sliderAccess.js"></script>
	<script src="date.js"></script>
	<script src="histogramRefresh.js"></script>
	<script type="text/javascript">
		var filter = new Object();
		filter.timeRange = new Object();
		rawData = new Object(); 
		//var timeRange = new Object();
		filter.timeRange.now = new Date();
		filter.timeRange.min = new Date();
		filter.timeRange.max = new Date();
		filter.duration = new Object();
		filter.duration.min = 1;
		filter.duration.max = 60;
		
	function filterRefresh(){
		pieRefresh();
		roamRefresh();
		cropRoams(myMin, myMax);
	
	}
				
	$(function() {
		
		$( "#accordion" ).accordion();
		$( "#accordion1" ).accordion({ collapsible: true });
		$( "#accordion2" ).accordion({ collapsible: true });
		$( "#accordion3" ).accordion({ collapsible: true });

		$( "#radioset" ).buttonset();
		
		//initialize slider
		$( "#slider" ).slider({
			range: true,
			values: [ filter.duration.min, filter.duration.max ],	//default values
			min: 1,
			max: 400,
			change: function( event, ui ) {
				
				filter.duration.min = ui.values[0];
				filter.duration.max = ui.values[1];
				
				$( "#amount" ).val( filter.duration.min + " - " + filter.duration.max );
				filterRefresh();
			},
			slide: function( event, ui ) {
				var myMin = ui.values[0];
				var myMax = ui.values[1];
				$( "#amount" ).val( myMin + " - " + myMax );
			}
		});
			
		//make first call	
		slideval = $("#slider").slider("option","values");
		
		$( "#from" ).datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 2,
            onSelect: function( selectedDate ) {
                //$( "#to" ).datepicker( "option", "minDate", selectedDate );
				console.log("From date selected: " + selectedDate);
				filter.timeRange.min = new Date(selectedDate);
				filter.timeRange.min.setHours(0,0,0);
				filterRefresh();
            }
        });
        $( "#to" ).datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 2,
            onSelect: function( selectedDate ) {
                //$( "#from" ).datepicker( "option", "maxDate", selectedDate );
				console.log("To date selected: " + selectedDate);
				filter.timeRange.max = new Date(selectedDate);
				filter.timeRange.max.setHours(23,59,59);
				filterRefresh();
            }
        });
		
	
        $( "#amount" ).val( $( "#slider" ).slider( "values", 0 ) +
            " - " + $( "#slider" ).slider( "values", 1 ) );
			
		
		$( "#from" ).datepicker('setDate', filter.timeRange.min);
		$( "#to" ).datepicker('setDate', filter.timeRange.max);
	});
	
	
	
	</script>
	
	
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
					
					 	<label for="from">From</label>
						<input type="text" id="from" name="from" />
						<label for="to">to</label>
						<input type="text" id="to" name="to" />
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
						<input type="radio" id="radio1" name="radio" checked="checked" onclick="update()"><label for="radio1">RSSI</label>
						<input type="radio" id="radio2" name="radio" onclick="update()"><label for="radio2">Bitrate</label>
						<input type="radio" id="radio3" name="radio" onclick="update()"><label for="radio3">Traffic</label>
					</div>
					</li>
					<?php /*
					<li>
						<select id="dataColumn" name="dataColumn" onchange="update()">
							<option value="rssi_val">RSSI</option>
							<option value="br_val">Bitrate</option>
							<option value="record_count">Traffic</option>
							
						</select>
					</li>
					*/
					?>
					<li>
						<input type="checkbox" onchange="refreshRoams()" checked="checked" value="roams" id="roam-checkbox">roams
						<ul>
							<li>
					
								<label for="amount">Duration:</label>
								<input type="text" id="amount" class="hi" style="border: 0; color: #f6931f; font-weight: bold;" />
								<div id="slider"></div>
							
							</li>
							<li>
								<input type="checkbox" onchange="refreshRoams()" checked="checked" value="AtoB" id="AtoB-checkbox">A->B
							</li>
							<li>
								<input type="checkbox" onchange="refreshRoams()" checked="checked" value="AtoA" id="AtoA-checkbox">A->A
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
			
			<div id="accordion1">
				<h3>First</h3>
				<div>Lorem ipsum dolor sit amet. Lore
					s
					fsdf
					<br><p>asdf</div>
			</div>
			<div id="accordion2">
				<h3>Second</h3>
				<div>Phasellus mattis tincidunt nibh.</div>
			</div>
			<div id="accordion3">
				<h3>Third</h3>
				<div>Nam dui erat, auctor a, dignissim quis.</div>
			</div>
			
			
		</div>
		<script>
			//Dynamic, random dataset
			var dataset = [];					//Initialize empty array
			var cellset = [];
			//var rssiset = [[],[]];

	
		</script>
		
		
		<div id="roamHist" class="chart"><h2>Duration Times</h2></div>
		
		<div id="chart" class="chart" style="padding-left:30px;"><h2>RSSI Values</h2></div>
		<div id="piechart" class="chart"><h2>Roams per Drive</h2></div>
		
		
		<script src="statistics.js"></script>
		<script src="roams.js"></script>
		<script src="histogram.js"></script>
		<script src="roamhistogram.js"></script>
		<script src="bar.js"></script>
		<script src="piechart.js"></script>
		
		
		
			</body>
		</html>		