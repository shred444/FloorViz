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




<script>
	var timeRange = new Object();
		timeRange.now = new Date();
		timeRange.min = new Date();
		timeRange.max = new Date();
		timeRange.min.setDate(timeRange.now.getDate()-4);
		timeRange.max.setDate(timeRange.now.getDate()-3);

	$(function() {
		$( "#accordion" ).accordion();
	});
</script>

<div id="sidebar" width="300">
	<div id="accordion">
		<h3>Selection</h3>
			<div>Lorem ipsum dolor sit amet. Lore</div>
		<h3>Filter</h3>
			<div>Phasellus mattis tincidunt nibh.</div>
		<h3>Details</h3>
			<div>Nam dui erat, auctor a, dignissim quis.</div>
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


<script src="map.js"></script>

</body>
</html>