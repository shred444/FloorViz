<html>
<head>
<script>
var myData;
function showUser(str){
	if (str==""){
		document.getElementById("txtHint").innerHTML="";
		return;
	}
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
		}
	}
	
	//call function to get data
	xmlhttp.open("GET","jsonSQL.php?db=amz_bfi1&q="+"SELECT * FROM roams limit " + str,true);
	xmlhttp.send();
}
</script>
</head>
<body>

<form>
<select name="users" onchange="showUser(this.value)">
<option value="">Select a person:</option>
<option value="1">Peter Griffin</option>
<option value="2">Lois Griffin</option>
<option value="3">Glenn Quagmire</option>
<option value="4">Joseph Swanson</option>
</select>
</form>
<br />
<div id="txtHint"><b>Person info will be listed here.</b></div>

</body>
</html>