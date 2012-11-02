<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">

	<link href="styles.css" rel="stylesheet">
	<link href="barstyles.css" rel="stylesheet">
	<link href="piestyles.css" rel="stylesheet">
	<link href="jquery-ui-1.9.0.custom/css/smoothness/jquery-ui-1.9.0.custom.css" rel="stylesheet">
	
	<script src="http://code.jquery.com/jquery-1.8.2.js"></script>
	<script src="http://code.jquery.com/ui/1.9.0/jquery-ui.js"></script>
	
</head>

<body>
<script src="http://d3js.org/d3.v3.min.js"></script>
<script src="date.js"></script>
<script src="filter.js"></script>

<?php 
	
	$con = mysql_connect("hwtest","jonathan","admin");
	if (!$con)
	{
		die('Could not connect: ' . mysql_error());
	}
	mysql_select_db("hwmhs", $con);
	?>

<script>
	//var site = "amz_bfi1";
	var site = "hwmhs";
	var enabledFilters = [];

	$(function() {
		$( "#accordion" )
			.accordion({
				header: "> div > h3",
				autoHeight: true,
				collapsible: true,
				heightStyle: "content",
				fillSpace: false
			})
			.sortable({
                axis: "y",
                handle: "h3",
                stop: function( event, ui ) {
                    // IE doesn't register the blur when sorting
                    // so trigger focusout handlers to remove .ui-state-focus
                    ui.item.children( "h3" ).triggerHandler( "focusout" );
					
					filterRefresh();
					
                }
            });
		
		//allow clicks on checkbox
		$('#accordion').find('input').click(
			function(e){
				e.stopPropagation();
			}
		);
		
		//initialize slider
		$( "#slider" ).slider({
			range: true,
			values: [ filter.duration.min, filter.duration.max ],	//default values
			min: 1,
			max: 100,
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
		
		$( "#from" ).datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 1,
            onSelect: function( selectedDate ) {
                //$( "#to" ).datepicker( "option", "minDate", selectedDate );
				console.log("From date selected: " + selectedDate);
				filter.timeRange.min = new Date(selectedDate);
				filter.timeRange.min.setHours(0,0,0);
				
				if(document.getElementById("to").hidden){
					filter.timeRange.max = new Date(selectedDate);
					filter.timeRange.max.setHours(23,59,59);
				
				}
				filterRefresh();
            }
        });
        $( "#to" ).datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 1,
            onSelect: function( selectedDate ) {
                //$( "#from" ).datepicker( "option", "maxDate", selectedDate );
				console.log("To date selected: " + selectedDate);
				filter.timeRange.max = new Date(selectedDate);
				filter.timeRange.max.setHours(23,59,59);
				filterRefresh();
            }
        });
		
		
		
	});
	
	
	function hideDate(checkbox){
		
		document.getElementById("to").hidden = !checkbox.checked;
			
	}
	
	function toggleFilter(checkbox){
		enabledFilters[checkbox.id] = checkbox.checked;
		filterRefresh();
		
		if(checkbox.checked){
			
		}else{
			
		}
	}
	function toggleAP(checkbox){
		//if(filter.rssi.aps[checkbox.id]){
			filter.rssi.aps[checkbox.id] = checkbox.checked;
		//}else{
		//array element doesnt exist
		//	console.log(checkbox.id + "does not exist");
		//}
		filterRefresh();
		
		
	}
</script>
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
			
				<label for="from">From</label>
				<input type="text" id="from" name="from" />
				<input type="checkbox" onchange="hideDate(this);" value="roams" id="date-checkbox">
						
				<label for="to">to</label>
				<input type="text" id="to" name="to" hidden="true" />
			</li>
			<li>
				<input type="submit" value="Refresh"> 
			</li>
			
			
		</ul>
	</form>
</div>

<div id="sidebar2" style="position: relative; width:300px; float:right;">
	<div id="accordion" style="position:relative;">
		<div class="group">
			<h3>Selection<input class='header-checkbox' type='checkbox' style="float:right; onclick="toggleFilter(this)""/></h3>
				<div width="300" id="selectionTab">No Selection.</div>
		</div>
		<div class="group">
			<h3>Filter<input class='header-checkbox' type='checkbox' style="float:right; onclick="toggleFilter(this)""/></h3>
			<div width="300">
				<ul style="list-style-type:none; padding-left:0px;">
					<li>
					<div id="radioset" name="dataColumn" >
						<input type="radio" id="radio1" name="radio" checked="checked"><label for="radio1">RSSI</label>
						<input type="radio" id="radio2" name="radio"><label for="radio2">Bitrate</label>
						<input type="radio" id="radio3" name="radio"><label for="radio3">Traffic</label>
					</div>
					</li>
					<li>
						<input type="checkbox" onchange="roamCheck();" checked="checked" value="roams" id="roam-checkbox">roams
						<ul>
							
							<li>
								<input type="checkbox" onchange="roamCheck()" checked="checked" value="AtoB" id="AtoB-checkbox">A->B
							</li>
							<li>
								<input type="checkbox" onchange="roamCheck()" checked="checked" value="AtoA" id="AtoA-checkbox">A->A
							</li>
							<li>
					
								<label for="amount">Duration:</label>
								<input type="text" id="amount" class="hi" style="border: 0; color: #f6931f; font-weight: bold;" />
								<div id="slider"></div>
							
							</li>
						</ul>
					</li>
					
					<li>
						<input type="checkbox" onchange="timeoutCheck()" checked="checked" value="timeouts" id="timeout-checkbox">timeouts
						<ul>
							<li>
								<input type="checkbox" onchange="timeoutCheck()" checked="checked" value="ping" id="ping-checkbox">Ping Failed
							</li>
							<li>
								<input type="checkbox" onchange="timeoutCheck()" checked="checked" value="fatalcomms" id="fatalcomms-checkbox">Fatal Comms
							</li>
						</ul>
					</li>
					
					
				</ul>
				
				
				</div>
			</div>
		<div class="group">		
			<h3>Drives<input class='header-checkbox' type='checkbox' style="float:right;" onclick="toggleFilter(this)"/></h3>
			<div width="300">Filter by Drive ID<br>
			<input class='du_id-all' type='checkbox'>Select All<p>
			<select name="du_id" size="5" style="width:100px">
			  <option>5001</option>
			  <option>5002</option>
			  <option>5003</option>
			  <option>5004</option>
			  <option>5005</option>
			  <option>5006</option>
			  <option>5007</option>
			  <option>5008</option>
			  <option>5009</option>
			</select>
			</div>
		</div>
		<div class="group">		
			<h3>Floor Map<input id="floormap" class='header-checkbox' type='checkbox' style="float:right;" onclick="toggleFilter(this)"/></h3>
			<div width="300">Floor Map Options</div>
		</div>
		<div class="group">		
			<h3>Roams<input id="roams" class='header-checkbox' type='checkbox' style="float:right;" onclick="toggleFilter(this)"/></h3>
			<div width="300">Roam Options</div>
		</div>
		<div class="group">		
			<h3>APs<input id="aps" class='header-checkbox' type='checkbox' style="float:right;" onclick="toggleFilter(this)"/></h3>
			<div width="300">Roam Options</div>
		</div>
		<div class="group">		
			<h3>Pings<input id="pings" class='header-checkbox' type='checkbox' style="float:right;" onclick="toggleFilter(this)"/></h3>
			<div width="300">Roam Options</div>
		</div>
		<div class="group">		
			<h3>Timeouts<input id="timeouts" class='header-checkbox' type='checkbox' style="float:right;" onclick="toggleFilter(this)"/></h3>
				<div width="300">Roam Options</div>
		</div>
		<div class="group">		
			<h3>RSSI<input id="rssi" class='header-checkbox' type='checkbox' style="float:right;" onclick="toggleFilter(this)"/></h3>
			<div width="300">
				RSSI Options<p>
				<?php 
				$result = mysql_query("select distinct(ap_id) from rssi");
				while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
					echo "<input type='checkbox' id='" . $row['ap_id'] . "' onclick='toggleAP(this)'>" . $row['ap_id'] . "<br>";
				}
					?>
				
			</div>
		</div>
	</div>
</div>

<div id="map"></div>


<table>
<tr><td>
<label>X</label><div id="xPos"></div>
</td><td>
<label>Y</label><div id="yPos"></div></td><td>
<label>Cells</label><div id="cellCount"></div>
</td></tr>
</table>


<script src="cisco.js"></script>

</body>
</html>