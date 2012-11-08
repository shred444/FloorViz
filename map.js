if (!window.console) console = {};
console.log = console.log || function(){};
console.warn = console.warn || function(){};
console.error = console.error || function(){};
console.info = console.info || function(){};

Array.max = function( array ){
    return Math.max.apply( Math, array );
};
Array.min = function( array ){
    return Math.min.apply( Math, array );
};


//WidtmapHeight and height
var mapWidth = 1000; //document.getElementById("map").width.baseVal.value;//1000;
var mapHeight = 500; //document.getElementById("map").height.baseVal.value;//700;
var padding = 50;
var axisPadding = 25;
var innerPadding = 10;
var drawingData;
var roamData = [];
var roamsChecked;
var dataColumn = 'br_val';		//data to filter on and display
var mapData = [];
var yScale, xScale, xAxis, yAxis;
var yAxis, yAxisR, xAxis, xAxisTop;
var minX, maxX, minY, maxY;
var map;
//-------------------------------------------------------------
//Create scale functions
//-------------------------------------------------------------
var drawingWidth = mapWidth - ((axisPadding + innerPadding ) *2);
var drawingHeight = mapHeight - (padding - innerPadding) * 2;



function mapScales(mapData){

	console.log("Map Scales");
	xScale = d3.scale.linear()
	.domain(
		[	minX,//Math.min.apply(Math,mapData.map(function(o){return Number(o.x);})),
			maxX +1//Math.max.apply(Math,mapData.map(function(o){return Number(o.x);})) + 1	//require 1 more for padding
		])
		.rangeRound([(axisPadding + innerPadding), mapWidth - axisPadding - (innerPadding * 2)]);	//only use one axis for the widtmapHeight subtraction

	yScale = d3.scale.linear()
	.domain(
		[	minY -1,//Math.min.apply(Math,mapData.map(function(o){return Number(o.y);})) -1, //require 1 more for padding
			maxY//Math.max.apply(Math,mapData.map(function(o){return Number(o.y);})) 	
		])
		.range([mapHeight - (axisPadding + innerPadding)*2, padding - innerPadding]);
		
	xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.ticks(5);

	xAxisTop = d3.svg.axis()
		.scale(xScale)
		.orient("top")
		.ticks(5)
		
			  
		  
	//-------------------------------------------------------------
	// Create All Axis
	//-------------------------------------------------------------
	//Define X axis
	xAxis = d3.svg.axis()
	.scale(xScale)
	.orient("bottom")
	.ticks(5);

	xAxisTop = d3.svg.axis()
	.scale(xScale)
	.orient("top")
	.ticks(5)

	//Define Y axis
	yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left")
	.ticks(5);

	//Define Y axis Right
	yAxisR = d3.svg.axis()
	.scale(yScale)
	.orient("right")
	.ticks(5);
		  
}


init();
drawFloor();


// runs once when the visualisation loads
function init () {
	console.log("Map Init");
	
	mapScales();
	
	
	//-------------------------------------------------------------
	//Create SVG element
	//-------------------------------------------------------------
	map = d3.select("#map")
	.append("svg")
	.attr("width", mapWidth)
	.attr("height", mapHeight);
	
		
	//-------------------------------------------------------------
	//Create X axis - bottom
	//-------------------------------------------------------------
	map.append("g")
	.attr("class", "axis")
	.attr("id", "xaxis")
	.attr("transform", "translate(0," + (mapHeight - axisPadding*2 - innerPadding) + ")")
	.attr("fill", "grey")
	.call(xAxis);
	
	//-------------------------------------------------------------
	//Create X axis - top
	//-------------------------------------------------------------
	map.append("g")
	.attr("class", "axis")
	.attr("id", "xaxistop")
	.attr("transform", "translate(0," + (0 + axisPadding ) + ")")
	.attr("fill", "grey")
	.call(xAxisTop);

	//-------------------------------------------------------------
	//Create Y axis - left
	//-------------------------------------------------------------
	map.append("g")
	.attr("class", "axis")
	.attr("id", "yaxis")
	.attr("transform", "translate(" + axisPadding + ",0)")
	.attr("fill", "grey")
	.call(yAxis);

	//-------------------------------------------------------------
	//Create Y axis - right
	//-------------------------------------------------------------
	map.append("g")
	.attr("class", "axis")
	.attr("id", "yaxisr")
	.attr("transform", "translate(" + (mapWidth - axisPadding - innerPadding) + ",0)")
	.attr("fill", "grey")
	.call(yAxisR);
	
	// load data, process it and dramapWidth it
	
	console.log("Map Init Complete");
}

function drawAPs() {
	
	function clickAP(data){
		filter.selection = data;
		document.getElementById("selectionTab").innerHTML = JSON.stringify(filter.selection, null, "<br>");
		$( "#accordion" ).accordion({ active: 0 });
	
	}
	
	
	//var mapquery = 'select floor(x/('+scale+'*1000))*'+scale+' as x, floor(y/('+scale+'*1000))*'+scale+' as y from rssi WHERE x<>0 and y<>0 GROUP BY floor(x/('+scale+'*1000)),floor(y/('+scale+'*1000));';
	var apquery = 'select * from aps WHERE x<>0 AND y<>0 AND ' + filter.aps.enabled;
	
	var apurl = "jsonSQL.php?db=" + site + "&q=" + apquery;
	console.log(apurl);
	
	d3.json(apurl, function(error, apData) {
		console.log("received aps "+ apData.length);

		var aps = map.selectAll(".ap").data(apData, function (d) { return d.id;});
		
		aps.enter()
			.insert("circle")
			.attr("cx", 				function(d) { return xScale(Number(d.x)); })
			.attr("class",			"ap")
			.attr("cy", 				function(d) { return yScale(d.y); })
			.attr("r",					5)
			.attr("fill", 			"yellow")
			.attr("stroke",			"black")
			.on("mouseup", 		function(d) { return clickAP(d);});
		
		
		aps.exit()
			.remove();

		aps.transition()
			.duration(1000);
	});
	
}



function drawTimeouts()
{
	function clickTimeout(data){
		filter.selection = data;
		document.getElementById("selectionTab").innerHTML = JSON.stringify(filter.selection, null, "<br>");
		$( "#accordion" ).accordion({ active: 0 });
	
	}
	
	var fatalquery = 'SELECT * FROM du_errors WHERE ' + filter.timeouts.where + ';';
	
		
	var fatalurl = "jsonSQL.php?db=" + site + "&q=" + fatalquery;
	console.log(fatalurl);
	
	var fatalCommsData= [];
	d3.json(fatalurl, function(error, fatalCommsData) {
	
		console.log("fatal comms data received with " + fatalCommsData.length + "data");
		
		
		var fataltimeout = map.selectAll(".fataltimeout").data(fatalCommsData, function (d) { return d.id;});

		fataltimeout.enter()
			.append("circle")
			.attr("class", "fataltimeout")
			.attr("cx", 			function(d) { return xScale(d.x/1000); })  //meters to mm
			.attr("cy", 			function(d) { return yScale(d.y/1000); })  //meters to mm
			.attr("r", 				5)
			.attr("fill", 			"blue")
			.attr("fill-opacity", 	.2)
			.attr("stroke",			"blue")
			.attr("stroke-opacity",	.6)
			.on("mouseup", 		function(d) { return clickTimeout(d);});

		fataltimeout.exit()
			.remove();
		
		
	});
	
}

function drawRoams() {
	
	function clickRoam(data){
		//alert("clicked on ap" + data.x);
		filter.selection = data;
		document.getElementById("selectionTab").innerHTML = JSON.stringify(filter.selection, null, "<br>");
		$( "#accordion" ).accordion({ active: 0 });
	
	}
	
	
	//var mapquery = 'select floor(x/('+scale+'*1000))*'+scale+' as x, floor(y/('+scale+'*1000))*'+scale+' as y from rssi WHERE x<>0 and y<>0 GROUP BY floor(x/('+scale+'*1000)),floor(y/('+scale+'*1000));';
	var roamquery = 'select * from roams2 WHERE ' + filter.roams.where;
	
	var roamurl = "jsonSQL.php?db=" + site + "&q=" + roamquery;
	console.log(roamurl);
	
	d3.json(roamurl, function(error, roamData) {
		console.log("received roams "+ roamData.length);
		var roams = map.selectAll(".roam").data(roamData, function (d) { return d.id;});
				
		roams.enter()
			.append("circle")
			.attr("cx", 				function(d) { return xScale(Number(d.x)); })
			.attr("class",				"roam")
			.attr("cy", 				function(d) { return yScale(d.y); })
			.attr("r",					function(d) { return d.duration; })
			.attr("fill", 				"red")
			.style("stroke", 			"red")
			.style("stroke-width", 		"1px")
			.attr("fill-opacity", 		.2)
			.attr("stroke-opacity", 		.6)
			.on("mouseup", 				function(d) { return clickRoam(d);});
		
		roams.exit()
			.remove();

		roams.transition()
			.duration(1000);
			
	});
	
}


function drawFloor() {
		
	that = this;
	
	//returns a color based on a cell value
	function cellFill(d) { 
		var scaled;
		
		switch (d.cell_type)
		{
		case 'K':
			return "#00A57C"; //#007FFF";
		case 'F':
		case 'L':
		case 'P':
		case 'G':
			return "#00FFFF"; //#007FFF";
		case 'M':
			return "#0000FF"; //#007FFF";
		default:
			return "yellow";
		}
	}

	function clickCell(data){
		//alert("clicked on ap" + data.x);
		filter.selection = data;
		document.getElementById("selectionTab").innerHTML = JSON.stringify(filter.selection, null, "<br>");
		$( "#accordion" ).accordion({ active: 0 });
	
	}
	
	var units = 1; //1 for meters, 1000 for mm
	var scale = 1.5;
	var mapquery = 'select loc_x/1000 as x, loc_y/1000 as y, cell_type from pod_storage WHERE ' + filter.floormap.enabled;
	//var mapquery = 'select * from (select loc_x/1000 as x, loc_y/1000 as y, cell_type from pod_storage UNION select loc_x/1000 as x, loc_y/1000 as y, @dummy from fiducials)a group by a.x,a.y ;';
	var mapurl = "jsonSQL.php?db=" + site + "&q=" + mapquery;
	console.log(mapurl);
	
	d3.json(mapurl, function(error, mapData) {
	
		console.log("mapData received: " + mapData.length);
		
		if(document.getElementById("cellCount"))
			document.getElementById("cellCount").innerHTML = mapData.length;
		
		
		//-------------------------------------------------------------
		//Create cells	
		//-------------------------------------------------------------
		
		maxX = Math.max.apply(Math, mapData.map(function(o){ return o.x; }));
		minX = Math.min.apply(Math, mapData.map(function(o){ return o.x; }));
		maxY = Math.max.apply(Math, mapData.map(function(o){ return o.y; }));
		minY = Math.min.apply(Math, mapData.map(function(o){ return o.y; }));
				
		
		countX = maxX - minX +1; //add one more for padding
		countY = maxY - minY +1; //add one more for padding
		
		
		cellWidth = (drawingWidth/(countX)) * scale - 2;	//subtract 1 for border
		cellHeight = (drawingHeight/(countY)) * scale - 2;	//subtract 1 for border
		
		//recalculate scales
		mapScales(mapData);
		
		
		
		var cells = map.selectAll(".cell").data(mapData, function (d) { return d.id;});
		
		cells.enter()
			.append("rect")
			.attr("id",				function(d) { return "Cell_" + d.x + "-" + d.y;})
			.attr("x", 				function(d) { return xScale(d.x); })
			.attr("class",			"cell")
			.attr("y", 				function(d) { return yScale(d.y); })
			.attr("width", 			cellWidth)
			.attr("height", 		cellHeight)
			.attr("fill", 			function(d) { return cellFill(d);})
			//.style("stroke", 			"white")
			.style("stroke-width", 		"1px")
			.on("mousemove", 		function(d) { return mousemove(d);})
			.on("mouseup", 			function(d) { return clickCell(d);});
		
		/*cells.enter()
			.append("circle")
			.attr("id",				function(d) { return "Cell_" + d.x + "-" + d.y;})
			.attr("cx", 				function(d) { return xScale(d.x); })
			.attr("class",			"cell")
			.attr("cy", 				function(d) { return yScale(d.y); })
			.attr("r", 				2)
			
			.attr("fill", 			"grey")
			.style("stroke", 			"black")
			.style("stroke-width", 		"1px")
			.on("mousemove", 		function(d) { return mousemove(d);});	
		*/
		cells.exit()
			.remove();

		cells.transition()
			.duration(1000)
			.attr("fill", function(d) {return cellFill(d);});
			
		
		//-------------------------------------------------------------
		// update axis
		//-------------------------------------------------------------
		map.selectAll("#xaxis").transition().duration(1000).call(xAxis);
		map.selectAll("#xaxistop").transition().duration(1000).call(xAxisTop);
		map.selectAll("#yaxis").transition().duration(1000).call(yAxis);
		map.selectAll("#yaxisr").transition().duration(1000).call(yAxisR);
	
	
		console.log("Redraw Complete");
		drawRoams();
		drawTimeouts();
		drawAPs();
	})
	
}


function mousemove(d){
	if(document.getElementById("xPos"))
		document.getElementById("xPos").innerHTML = Math.round(d.x);
	if(document.getElementById("yPos"))
		document.getElementById("yPos").innerHTML = Math.round(d.y);
	
}
