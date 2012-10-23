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


//Width and height
var w = document.getElementById("map").width.baseVal.value;//1000;
var h = document.getElementById("map").height.baseVal.value;//700;
var padding = 50;
var axisPadding = 25;
var innerPadding = 10;
var drawingData;
var roamData = [];
var roamsChecked;
var dataColumn = 'br_val';		//data to filter on and display
var mapData;



//-------------------------------------------------------------
//Create scale functions
//-------------------------------------------------------------
var drawingWidth = w - ((axisPadding + innerPadding ) *2);
var drawingHeight = h - (padding - innerPadding) * 2;
var minX, maxX, minY, maxY;


function mapScales(mapData){

	console.log("Map Scales");
	xScale = d3.scale.linear()
	.domain(
		[	minX,//Math.min.apply(Math,mapData.map(function(o){return Number(o.x);})),
			maxX +1//Math.max.apply(Math,mapData.map(function(o){return Number(o.x);})) + 1	//require 1 more for padding
		])
		.rangeRound([(axisPadding + innerPadding), w - axisPadding - (innerPadding * 2)]);	//only use one axis for the width subtraction

	yScale = d3.scale.linear()
	.domain(
		[	minY -1,//Math.min.apply(Math,mapData.map(function(o){return Number(o.y);})) -1, //require 1 more for padding
			maxY//Math.max.apply(Math,mapData.map(function(o){return Number(o.y);})) 	
		])
		.range([h - (axisPadding + innerPadding)*2, padding - innerPadding]);

	var rScale = d3.scale.linear()
		//.domain([0, d3.max(cellset, function(d) { return d[1]; })])
		.domain([0,100])
		.range([2, 5]);

	var rssiMin = Array.min(mapData.map(function(o){return o[dataColumn];}));
	var rssiMax = Array.max(mapData.map(function(o){return o[dataColumn];}));
	var rssiScale = d3.scale.linear()
		//.domain([d3.min(cellset, function(d) { return d[2]; }), d3.max(cellset, function(d) { return d[2]; })])
		.domain([rssiMin,rssiMax])
		.range([0, 1]);
	var trafficScale = d3.scale.linear()
		//.domain([d3.min(cellset, function(d) { return d[2]; }), d3.max(cellset, function(d) { return d[2]; })])
		.domain([0,100])
		.range([0, 1]);

	var rssiColorScale = d3.scale.ordinal()
		  .domain([0,1,2,3,4,5,6,7,8,9,10])
		  .range(["#A50026", "#D73027", "#F46D43", "#FDAE61", "#FEE08B", "#D9EF8B", "#A6D96A", "#66BD63", "#1A9850", "#006837"]);
		  //0xA50026; 0xD73027; 0xF46D43; 0xFDAE61; 0xFEE08B; 0xD9EF8B; 0xA6D96A; 0x66BD63; 0x1A9850; 0x006837
		  
		  
	var trafficColorScale = d3.scale.linear()
		  .domain([0,10])
		  .range(["#CCECE6", "#005824"])
		  .clamp(true);	  
		  //0xEDF8FB; 0xCCECE6; 0xCCECE6; 0x66C2A4; 0x41AE76; 0x238B45; 0x005824; 
	  
}


var xScale = d3.scale.linear()
	.domain(
		[0,100])
		.rangeRound([(axisPadding + innerPadding), w - axisPadding - (innerPadding * 2)]);	//only use one axis for the width subtraction

	var yScale = d3.scale.linear()
	.domain(
		[0,100])
		.range([h - (axisPadding + innerPadding)*2, padding - innerPadding]);





//mapScales();
init();
redraw();


// runs once when the visualisation loads
function init () {
	console.log("Map Init");
	
	
	//-------------------------------------------------------------
	// Create All Axis
	//-------------------------------------------------------------
	//Define X axis
	var xAxis = d3.svg.axis()
	.scale(xScale)
	.orient("bottom")
	.ticks(5);

	var xAxisTop = d3.svg.axis()
	.scale(xScale)
	.orient("top")
	.ticks(5)

	//Define Y axis
	var yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left")
	.ticks(5);

	//Define Y axis Right
	var yAxisR = d3.svg.axis()
	.scale(yScale)
	.orient("right")
	.ticks(5);
	
	
	//-------------------------------------------------------------
	//Create SVG element
	//-------------------------------------------------------------
	svg = d3.select("#map")
	.append("svg")
	.attr("width", w)
	.attr("height", h);
	
		
	//-------------------------------------------------------------
	//Create X axis - bottom
	//-------------------------------------------------------------
	svg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(0," + (h - axisPadding*2 - innerPadding) + ")")
	.attr("fill", "grey")
	.call(xAxis);
	
	//-------------------------------------------------------------
	//Create X axis - top
	//-------------------------------------------------------------
	svg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(0," + (0 + axisPadding ) + ")")
	.attr("fill", "grey")
	.call(xAxisTop);

	//-------------------------------------------------------------
	//Create Y axis - left
	//-------------------------------------------------------------
	svg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(" + axisPadding + ",0)")
	.attr("fill", "grey")
	.call(yAxis);

	//-------------------------------------------------------------
	//Create Y axis - right
	//-------------------------------------------------------------
	svg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(" + (w - axisPadding - innerPadding) + ",0)")
	.attr("fill", "grey")
	.call(yAxisR);
	
	// load data, process it and draw it
	
	console.log("Map Init Complete");
}



function redraw () {
		
	that = this;
	
	//returns a color based on a cell value
	function cellFill(d) { 
		var scaled;
		/*
		if(dataColumn=='record_count'){
			scaled = trafficScale(d[dataColumn])*10;
			return trafficColorScale(Math.round(scaled)-1);
		}else{
			scaled = rssiScale(d[dataColumn])*10;
			return rssiColorScale(Math.round(scaled)-1); 
		}
		*/
		return 1;
	}

	
	
	var mapquery = 'select floor(x/1000) as x, floor(y/1000) as y from du_errors WHERE x<>0 and y<>0 GROUP BY floor(x/1000),floor(y/1000);';
	
		
	var mapurl = "jsonSQL.php?db=hwmhs&q=" + mapquery;
	console.log(mapurl);
	
	d3.json(mapurl, function(error, mapData) {
	
		console.log("mapData received: " + mapData.length);
		
		//-------------------------------------------------------------
		//Create cells	
		//-------------------------------------------------------------
		
		maxX = Math.max.apply(Math, mapData.map(function(o){ return o.x; }));
		minX = Math.min.apply(Math, mapData.map(function(o){ return o.x; }));
		maxY = Math.max.apply(Math, mapData.map(function(o){ return o.y; }));
		minY = Math.min.apply(Math, mapData.map(function(o){ return o.y; }));
		
		countX = maxX - minX +1; //add one more for padding
		countY = maxY - minY +1; //add one more for padding
		
		cellWidth = (drawingWidth/(countX));// * floor;
		cellHeight = (drawingHeight/(countY));// * floor;
		
		mapScales(mapData);
		
		
		var cells = svg.selectAll("rect").data(mapData, function (d) { return d.id;});
		cells.enter()
			.append("rect")
			.attr("id",				function(d) { return "Cell_" + d.x + "-" + d.y;})
			.attr("x", 				function(d) { return xScale(d.x); })
			//.attr("class",			"level1")
			.attr("y", 				function(d) { return yScale(d.y); })
			.attr("width", 			cellWidth)//function(d) { return 4 * floor; })
			.attr("height", 		cellHeight)//function(d) { return 4 * floor; })
			.attr("fill", 			function(d) { return cellFill(d);})
			.append("svg:title");
		
		console.log("cells created");
		//mouseover title
		/*cells.select("title")
		   .text(function(d) { return "x:"+d.x + " y:"+d.y +"rssi:"+d.rssi_val+"["+Math.round(rssiScale(d.br_val)*10) +"] br: " + d.br_val + " count:" +d.record_count; });
		*/
		
		//change this
		/*cells.filter(function(d) { return d in drawingData; })
		   .attr("class", function(d) { return "day q" + color(data[d]) + "-9"; })
		 .select("title")
		   .text(function(d) { return d + ": " + percent(data[d]); });
		*/
		cells.exit()
			.remove();

		cells.transition()
			.duration(1000)
			.attr("fill", function(d) {return cellFill(d);});
	});
	console.log("Redraw Complete");
	
	
}
// let's kick it all off!
