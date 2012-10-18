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

<div id="piechart"></div>

<script src="piechart.js"></script>

</body>
</html>