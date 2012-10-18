if (!window.console) console = {};
console.log = console.log || function(){};
console.warn = console.warn || function(){};
console.error = console.error || function(){};
console.info = console.info || function(){};

/*
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
			if(typeof redrawHist == 'function')
				redrawHist();
		}
	}

	//ajax query
	//var query = 'SELECT floor(duration/10)*10 as duration, count(*) as count FROM roams WHERE duration BETWEEN ' + minDuration + ' AND ' + maxDuration + ' AND dataset_id = (SELECT data_id from datasets where name=\"' + selectedDataset + '\") GROUP BY floor(duration/10)*10;';
	var query = 'SELECT floor(duration/10)*10 as duration, count(*) as count FROM roams WHERE duration BETWEEN ' + filter.duration.min + ' AND ' + filter.duration.max + ' AND roam_time BETWEEN \"' + filter.timeRange.min.format(Date.SQL) + '\" AND \"' + filter.timeRange.max.format(Date.SQL) + '\" GROUP BY floor(duration/10)*10;';
	xmlhttp.open("GET","jsonSQL.php?db=amz_bfi1&q="+ query,true);
	xmlhttp.send();
}
*/
/*
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
			if(typeof refreshRoams == 'function')
				refreshRoams();
		}
	}

	//ajax query
	//var query = 'SELECT * FROM roams WHERE dataset_id=(SELECT data_id FROM datasets where name =\"' + selectedDataset + '\") and duration between ' + minDuration + ' AND ' + maxDuration + ' AND origin_ap <> dest_ap;';
	var query = 'SELECT * FROM roams WHERE roam_time BETWEEN \"' + filter.timeRange.min + '\" AND \"' + filter.timeRange.max + '\" and duration between ' + filter.duration.min + ' AND ' + filter.duration.max + ' AND origin_ap <> dest_ap;';
	//var query = 'SELECT * FROM roams limit 10;';
	
	xmlhttp.open("GET","jsonSQL.php?db=amz_bfi1&q="+ query,true);
	xmlhttp.send();
}

*/

$(function() {
	
	
	//cropRoams(slideval[0],slideval[1]);
	//alert('done');
	//roamRefresh(slideval[0],slideval[1]);
	//pieRefresh(slideval[0],slideval[1]);
});