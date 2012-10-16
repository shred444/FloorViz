function cropRoams(minDuration,maxDuration){

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
			
			rawData.roamhist = JSON.parse(xmlhttp.responseText);
			redraw();
		}
	}

	//ajax query
	var query = 'SELECT floor(duration/10)*10 as duration, count(*) as count FROM roams WHERE duration BETWEEN ' + minDuration + ' AND ' + maxDuration + ' AND dataset_id = (SELECT data_id from datasets where name=\"' + selectedDataset + '\") GROUP BY floor(duration/10)*10;';
	xmlhttp.open("GET","jsonSQL.php?db=amz_bfi1&q="+ query,true);
	xmlhttp.send();
}

$(function() {
	
	//initialize slider
	$( "#slider" ).slider({
			range: true,
			values: [ 17, 67 ],
			slide: function( event, ui ) {
				cropRoams(ui.values[ 0 ], ui.values[ 1 ]);
                $( "#amount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
            }
		});
		
	//make first call	
	slideval = $("#slider").slider("option","values");
	cropRoams(slideval[0],slideval[1]);
});