if (!window.console) console = {};
console.log = console.log || function(){};
console.warn = console.warn || function(){};
console.error = console.error || function(){};
console.info = console.info || function(){};

function cropRoams(minDuration,maxDuration){
	var xmlhttp;
	
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
			console.log("Received response from cropRoams");
			rawData.roamhist = JSON.parse(xmlhttp.responseText);
			redraw();
		}
	}

	//ajax query
	var query = 'SELECT floor(duration/10)*10 as duration, count(*) as count FROM roams WHERE duration BETWEEN ' + minDuration + ' AND ' + maxDuration + ' AND dataset_id = (SELECT data_id from datasets where name=\"' + selectedDataset + '\") GROUP BY floor(duration/10)*10;';
	xmlhttp.open("GET","jsonSQL.php?db=amz_bfi1&q="+ query,true);
	xmlhttp.send();
}

function roamRefresh(minDuration,maxDuration){
	var xmlhttp;
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
			console.log("Received response from roamRefresh");
			rawData.roams = JSON.parse(xmlhttp.responseText);
			refreshRoams();
			//alert('data received');
		}
	}

	//ajax query
	var query = 'SELECT * FROM roams WHERE dataset_id=(SELECT data_id FROM datasets where name =\"' + selectedDataset + '\") and duration between ' + minDuration + ' AND ' + maxDuration + ' AND origin_ap <> dest_ap;';
	//var query = 'SELECT * FROM roams limit 10;';
	
	xmlhttp.open("GET","jsonSQL.php?db=amz_bfi1&q="+ query,true);
	xmlhttp.send();
}

$(function() {
	
	//initialize slider
	$( "#slider" ).slider({
		range: true,
		values: [ 1, 60 ],	//default values
		min: 1,
		max: 400,
		change: function( event, ui ) {
			var myMin = ui.values[0];
			var myMax = ui.values[1];
			cropRoams(myMin, myMax);
			
			$( "#amount" ).val( myMin + " - " + myMax );
			roamRefresh(myMin,myMax);
		},
		slide: function( event, ui ) {
			var myMin = ui.values[0];
			var myMax = ui.values[1];
			$( "#amount" ).val( myMin + " - " + myMax );
		}
	});
		
	//make first call	
	slideval = $("#slider").slider("option","values");
	cropRoams(slideval[0],slideval[1]);
	//alert('done');
	roamRefresh(slideval[0],slideval[1]);
});