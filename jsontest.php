<html>
<head>
	<script src="http://d3js.org/d3.v2.js"></script>
	<link href="jquery-ui-1.9.0.custom/css/smoothness/jquery-ui-1.9.0.custom.css" rel="stylesheet">
	<link href="styles.css" rel="stylesheet">
	<link href="barstyles.css" rel="stylesheet">
	
	<script src="jquery-ui-1.9.0.custom/js/jquery-1.8.2.js"></script>
	<script src="jquery-ui-1.9.0.custom/js/jquery-ui-1.9.0.custom.js"></script>
<script src="histogramRefresh.js"></script>
</head>
<body>
<script>
	var rawData = new Object();
	var selectedDataset = "2012-10-15 14:23:46";	
</script>
<form>
<select name="users" onchange="showUser(this.value,200)">
<option value="">Select a person:</option>
<option value="1">Peter Griffin</option>
<option value="2">Lois Griffin</option>
<option value="3">Glenn Quagmire</option>
<option value="4">Joseph Swanson</option>
</select>
</form>
<br />
<div id="txtHint"><b>JSON data will be listed here.</b></div>
<div id="slider" style="width:400px;"></div>

<div id="durationchart" class="histogram" width="500">

<div id="roamHist"><h2>Duration Times</h2></div>
</div>
		
		
<script src="roamhistogram.js"></script>

</body>
</html>