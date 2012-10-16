<html>
<head>
	<script src="http://d3js.org/d3.v2.js"></script>
<script>
var myData;
function showUser(minDuration,maxDuration){
	/*if (str==""){
		document.getElementById("txtHint").innerHTML="";
		return;
	}*/
	if (window.XMLHttpRequest)	{// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	else {// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	xmlhttp.onreadystatechange=function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			//state is ready and data is good
			document.getElementById("txtHint").innerHTML=xmlhttp.responseText;
			myData = JSON.parse(xmlhttp.responseText);
			rawData.roamhist = myData;
			redraw();
		}
	}
	
	
	
	var query = 'SELECT floor(duration/10)*10 as duration, count(*) as count FROM roams WHERE duration BETWEEN ' + minDuration + ' AND ' + maxDuration + ' AND dataset_id = 15 GROUP BY floor(duration/10)*10;';
	xmlhttp.open("GET","jsonSQL.php?db=amz_bfi1&q="+ query,true);
	xmlhttp.send();
}
</script>
</head>
<body>
<script>
			
var rawData = new Object();
			
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
<div id="txtHint"><b>Person info will be listed here.</b></div>


<svg id="roamHist"></svg>
		
		
<script src="roamhistogram.js"></script>
</body>
</html>