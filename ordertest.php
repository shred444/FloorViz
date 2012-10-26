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



<script>
	var site = "amz_bfi1";
	//var site = "hwmhs";

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
</script>
<div id="map"></div>


<script>
	
	var mapData=[];
	var layers=[];
	layers[0] = "hello";
	layers[1] = "goodbye";
	layers[2] = "fine";
	
	var temp = new Object();
	temp.id = 0;
	temp.x = 5;
	temp.y = 10;
	temp.color = "green";
	mapData[0] = temp;
	
	temp = new Object();
	temp.id = 1;
	temp.x = 30;
	temp.y = 20;
	temp.color = "red";
	mapData[1] = temp;
	mapData[2] = temp;
	
	//create SVG Container
	var map = d3.select("#map").append("svg");
	
	//create g layers
	var layer = map.selectAll("g").data(layers)
		.enter().append("g")
			.attr("id", function(d){ return d; })
			.attr("class" , "layer")
			.attr("width", 500)
			.attr("height", 300);
			
	//populate each layer
	layer.selectAll("rect").data(mapData)
		.enter().append("rect")
			.attr("x", 				function(d){ return d.x;})
			.attr("class",			"cell")
			.attr("y", 				function(d){ return d.y;})
			.attr("width", 			10)
			.attr("height", 		10)
			.attr("fill",			function(d){ return d.color;});
	/*
	layer.exit()
		.remove();
	*/
</script>

</body>
</html>