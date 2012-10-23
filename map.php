<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">

	<link href="styles.css" rel="stylesheet">
	<link href="barstyles.css" rel="stylesheet">
	<link href="piestyles.css" rel="stylesheet">
	
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
</script>

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