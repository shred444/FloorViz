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
var w = document.getElementById("visualization").width.baseVal.value;//1000;
var h = document.getElementById("visualization").height.baseVal.value;//700;
var padding = 50;
var axisPadding = 25;
var innerPadding = 10;
var drawingData;
var roamData = [];
var roamsChecked;
var dataColumn = 'br_val';		//data to filter on and display

var channelcolors = [];
channelcolors[0] = "black";
channelcolors[1] = "orange";
channelcolors[2] = "green";
channelcolors[3] = "blue";
channelcolors[4] = "purple";
channelcolors[5] = "red";
channelcolors[6] = "cyan";
channelcolors[7] = "lime";
channelcolors[8] = "pink";

channelcolors[158] = "orange";
channelcolors[153] = "green";
channelcolors[149] = "blue";
channelcolors[161] = "purple";
//var channelcolors = ["red","orange","yellow","green","blue","purple","cyan","lime", "royalblue"];
var svg;

//initialization functions
populateDatasets('facility');

//-------------------------------------------------------------
//Create scale functions
//-------------------------------------------------------------
var drawingWidth = w - ((axisPadding + innerPadding ) *2);
var drawingHeight = h - (padding - innerPadding) * 2;
var xScale = d3.scale.linear()
.domain(
	[	Math.min.apply(Math,rawData.rssi.map(function(o){return o.x;})),
		Math.max.apply(Math,rawData.rssi.map(function(o){return o.x;})) + 1	//require 1 more for padding
	])
	.rangeRound([(axisPadding + innerPadding), w - axisPadding - (innerPadding * 2)]);	//only use one axis for the width subtraction

var yScale = d3.scale.linear()
.domain(
	[	Math.min.apply(Math,rawData.rssi.map(function(o){return o.y;})) -1, //require 1 more for padding
		Math.max.apply(Math,rawData.rssi.map(function(o){return o.y;})) 	
	])
	.range([h - (axisPadding + innerPadding)*2, padding - innerPadding]);

var rScale = d3.scale.linear()
	//.domain([0, d3.max(cellset, function(d) { return d[1]; })])
	.domain([0,100])
	.range([2, 5]);

var rssiMin = Array.min(rawData.rssi.map(function(o){return o[dataColumn];}));
var rssiMax = Array.max(rawData.rssi.map(function(o){return o[dataColumn];}));
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

// return the name of the dataset which is currently selected
function getChosenDataset () {
	var select = document.getElementById("dataset");
	return select.options[select.selectedIndex].value;
}

// return an object containing the currently selected axis choices
function getAxes () {
	var roambox = document.getElementById("roams");
	var x,// = document.querySelector("#x-axis input:checked").value,
		y,// = document.querySelector("#y-axis input:checked").value,
		r,// = document.querySelector("#r-axis input:checked").value,
		roams_checked = roambox.value;
		
	return {
		xAxis: x,
		yAxis: y,
		radiusAxis: r,
		roams_checked: roams_checked
	};
}

// runs once when the visualisation loads
function init () {
	
	//-------------------------------------------------------------
	//Create SVG element
	//-------------------------------------------------------------
	svg = d3.select("#visualization")
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
	
	
	//set form colors
	for (var i=0; i<rawData.channels.length; i++)
	{
		//get each channel
		var numstring = rawData.channels[i].channel.toString();
		//assign a color to it
		document.getElementById('label-' + numstring).style.color = channelcolors[rawData.channels[i].channel];
	}
	
	// load data, process it and draw it
	update ();
}


// take a raw dataset and remove coasters which shouldn't be displayed
// (i.e. if it is "dirty" or it's type isn't selected)
function processData (data) {
	
	var processed = [],
	//cullDirty = document.getElementById("cull-dirty").checked,
	coasterTypes = {},
	counter = 1;

	var selectedChannels = [];
	
	
	//get data for each channel
	rawData.channels.forEach (function (chan, index) {
		var checked = document.getElementById("channel-" + chan.channel).checked;
		if(checked)
			selectedChannels.push(Number(chan.channel));
	});
	
	
	document.getElementById("dataDetails").innerHTML=processed.length + "/" + data.length + "   " + selectedChannels;

	console.log("All Data:");
	console.log(data);
	var rssi_data = data.map(function(o){ return Number(o[dataColumn]); });
	var rssi_avg = getAverageFromNumArr(rssi_data,4);
	var rssi_dev = getStandardDeviation(rssi_data,4);
	
	console.log(rssi_data);
	console.log("Average: "+getAverageFromNumArr(rssi_data,4));
	console.log("StdDev: "+getStandardDeviation(rssi_data,4));
	console.log("Variance: "+getVariance(rssi_data,4));
	
	
	data.forEach (function (data, index) {
		var coaster,
		className = "";
			
	
		if(selectedChannels.indexOf(Number(data.channel)) >=0)
		{
			
			coaster = {
				id: index // so that the coasters can animate
			};
			for (var attribute in data) {
				if (data.hasOwnProperty (attribute)) {
					coaster[attribute] = data[attribute]; // populate the coaster object
				}
			}
			if (typeof coasterTypes[data.type] == "undefined") { // generate a classname for the coaster based on it's type (used for styling)
				coasterTypes[data.type] = {
					id: counter - 1,
					className: 'coastertype-' + counter,
					name: data.type,
					//slug: slugify(data.type)
				};
				counter = counter + 1;
			}
			coaster.type = coasterTypes[data.type];
			
			//trim the fat
			if(coaster[dataColumn]>rssiMax){
				coaster[dataColumn] = rssiMax;
			}else if(coaster[dataColumn]<rssiMin){
				coaster[dataColumn] = rssiMin;
			}
			processed.push (coaster); // add the coaster to the outputs
		
		}//else, not part of the dataset
	});
	
	
	console.log("Cut Data: ")
	console.log(processed);
	//document.getElementById("dataDetails").innerHTML=processed.length + "/" + data.length + "   " + channel1 + channel2 + channel3 + channel4;

	return processed; // only contains coasters we're interested in visualising
}

// called every time a form field has changed
function update () {

	dataColumn = filter.dataColumn;	
	console.log("Data Column: " + dataColumn);
	
	//update scales
	rssiMin = Array.min(rawData.rssi.map(function(o){return o[dataColumn];}));
	rssiMax = Array.max(rawData.rssi.map(function(o){return o[dataColumn];}));
	
	rssiScale = d3.scale.linear()
		.domain([rssiMin,rssiMax])
		.range([0, 1]);
	
	var processedData; 					// the data while will be visualised

	//processedData = processData(rawData.rssi);
	drawingData = rawData.rssi; //processedData;
	console.log("rssiMin="+rssiMin + "   rssiMax="+rssiMax);
	redraw();
	
}

function refreshRoams()
{
	console.log("Refresh Roams Called");
	
	//roam selection
	roamData = [];
	roamsChecked = document.getElementById("roam-checkbox").checked;
	
	if(roamsChecked){
		document.getElementById("AtoB-checkbox").disabled = false;
		document.getElementById("AtoA-checkbox").disabled = false;
		
		if(document.getElementById("AtoB-checkbox").checked){
			roamData = roamData.concat(rawData.roams); 
		}
		if(document.getElementById("AtoA-checkbox").checked){
			roamData = roamData.concat(rawData.single);
		}
		
	}else{
		document.getElementById("AtoB-checkbox").disabled = true;
		document.getElementById("AtoA-checkbox").disabled = true;
	}
	
	
	
	var roams = svg.selectAll("circle").data(roamData, function (d) {return d.roam_id;});
	//var roams = svg.selectAll("circle").data(rawData.roams, function (d) {return d.roam_id;});
	
	roams.enter()
		.append("circle")
		.attr("cx", 			function(d) { return xScale(d.x); })
		.attr("cy", 			function(d) { return yScale(d.y); })
		.attr("r", 				function(d) { return d.duration; })
		.attr("fill", 			function(d) { return "red"; })
		.attr("fill-opacity", 	function(d) { return .3; })
		//.on("mouseover", fade(.1))
		//.on("mouseout", fade(1))
		.on("mouseup", 			function(d)	{ alert(d.roam_id + ") " + d.roam_time + " Duration: " + d.duration); });
	
	 function fade(opacity) {
		
		return function(d, i) {
			svg.selectAll("d.circle")
				.filter(function(d) {
					return d.roam_id;
				})
				.transition()
				.style("opacity", opacity);
		};
	}
	
	roams.exit()
		.remove();
		
}



function roamRefresh(){
	if(filter.roams.atob && !filter.roams.atoa)
		var dest = "AND origin_ap <> dest_ap";
	else if(filter.roams.atoa && !filter.roams.atob)
		var dest = "AND origin_ap = dest_ap";
	else
		var dest = "";
		
		
	
	var roamquery = 'SELECT * FROM roams WHERE ' + filter.roams.where;// + ' ' + dest + ';';
	
	if(!filter.roams.enabled)
		roamquery = 'SELECT * FROM roams WHERE 0';
	
	var roamurl = "jsonSQL.php?db=amz_bfi1&q=" + roamquery;

	console.log(roamurl);
	var roamData= [];
	d3.json(roamurl, function(error, roamData) {
		console.log("Roam data received with " +roamData.length + " data");
		
		var roams = svg.selectAll("circle").data(roamData, function (d) {return d.roam_id;});
		//var roams = svg.selectAll("circle").data(rawData.roams, function (d) {return d.roam_id;});
		
		roams.enter()
			.append("circle")
			.attr("cx", 			function(d) { return xScale(d.x); })
			.attr("cy", 			function(d) { return yScale(d.y); })
			.attr("r", 				function(d) { return d.duration; })
			.attr("fill", 			function(d) { return "red"; })
			.attr("fill-opacity", 	function(d) { return .3; })
			//.on("mouseover", fade(.1))
			//.on("mouseout", fade(1))
			.on("mouseup", 			function(d)	{ alert(d.roam_id + ") " + d.roam_time + " Duration: " + d.duration); });
		
		 function fade(opacity) {
			
			return function(d, i) {
				svg.selectAll("d.circle")
					.filter(function(d) {
						return d.roam_id;
					})
					.transition()
					.style("opacity", opacity);
			};
		}
		
		roams.exit()
			.remove();
	});

}

function redraw () {
		
	that = this;
	
	//returns a color based on a cell value
	function cellFill(d) { 
		var scaled;
		if(dataColumn=='record_count'){
			scaled = trafficScale(d[dataColumn])*10;
			return trafficColorScale(Math.round(scaled)-1);
		}else{
			scaled = rssiScale(d[dataColumn])*10;
			return rssiColorScale(Math.round(scaled)-1); 
		}
	}

	//-------------------------------------------------------------
	//Create cells	
	//-------------------------------------------------------------
	
	maxX = Math.max.apply(Math, rawData.rssi.map(function(o){ return o.x; }));
	minX = Math.min.apply(Math, rawData.rssi.map(function(o){ return o.x; }));
	maxY = Math.max.apply(Math, rawData.rssi.map(function(o){ return o.y; }));
	minY = Math.min.apply(Math, rawData.rssi.map(function(o){ return o.y; }));
	
	countX = maxX - minX +1; //add one more for padding
	countY = maxY - minY +1; //add one more for padding
	
	cellWidth = (drawingWidth/(countX)) * floor;
	cellHeight = (drawingHeight/(countY)) * floor;
	
	var cells = svg.selectAll("rect").data(drawingData, function (d) { return d.id;});
	cells.enter()
		.append("rect")
		.attr("id",				function(d) { return "Cell_" + d.x + "-" + d.y;})
		.attr("x", 				function(d) { return xScale(d.x); })
		//.attr("class",			"level1")
		.attr("y", 				function(d) { return yScale(d.y); })
		.attr("width", 			cellWidth)//function(d) { return 4 * floor; })
		.attr("height", 		cellHeight)//function(d) { return 4 * floor; })
		.attr("fill", 			function(d) { return cellFill(d);})
		.on("mousemove", mousemove)
		.append("svg:title");
		
	//mouseover title
	cells.select("title")
       .text(function(d) { return "x:"+d.x + " y:"+d.y +"rssi:"+d.rssi_val+"["+Math.round(rssiScale(d.br_val)*10) +"] br: " + d.br_val + " count:" +d.record_count; });
	
	
	//change this
	cells.filter(function(d) { return d in drawingData; })
       .attr("class", function(d) { return "day q" + color(data[d]) + "-9"; })
     .select("title")
       .text(function(d) { return d + ": " + percent(data[d]); });
	
	cells.exit()
		.remove();

	cells.transition()
        .duration(1000)
        .attr("fill", function(d) {return cellFill(d);});
	
	console.log("Redraw Complete");
	
	drawTimeouts();
	
}
// let's kick it all off!
init ();

//-------------------------------------------------------------
// Callbacks
//-------------------------------------------------------------
//document.getElementById("controls").addEventListener ("click", update, false);
//document.getElementById("controls").addEventListener ("keyup", update, false);


function drawTimeouts()
{
	if(filter.timeouts.fatalcomms)
		var fatalquery = 'SELECT * FROM du_errors where error = 2002 AND time BETWEEN \"' + filter.timeRange.min.format(Date.SQL) + '\" AND \"' + filter.timeRange.max.format(Date.SQL) + '\";';
	else
		var fatalquery = 'SELECT * FROM du_errors WHERE 0;';
		
	var fatalurl = "jsonSQL.php?db=amz_bfi1&q=" + fatalquery;
	console.log(fatalurl);
	
	var fatalCommsData= [];
	d3.json(fatalurl, function(error, fatalCommsData) {
	
		console.log("fatal comms data received with " + fatalCommsData.length + "data");
		
		
		var fataltimeout = svg.selectAll("#fataltimeout").data(fatalCommsData);

		fataltimeout.enter()
			.append("circle")
			.attr("class", "fataltimeout")
			.attr("cx", 			function(d) { return xScale(d.x/1000); })  //meters to mm
			.attr("cy", 			function(d) { return yScale(d.y/1000); })  //meters to mm
			.attr("r", 				function(d) { return 5; })
			.attr("fill", 			function(d) { return "blue"; })
			.attr("fill-opacity", 	function(d) { return .5; });

		fataltimeout.exit()
			.remove();
		
		
	});
	
}

function mousemove(){
	var x = xScale.invert(d3.mouse(this)[0]);
	var y = yScale.invert(d3.mouse(this)[0]);
	//console.log(x + " " + y);
}


function populateDatasets (form){
    var availableDatasets = ""; 
	selectedSite = document.getElementById(form).site.value;
	datasetField = document.getElementById(form).dataset;
	//selectField = document.getElementById(FieldID);
	datasetField.options.length = 0;
	//selectField.disabled = false;
	
	
	availableDatasets = datasets[selectedSite];
	
	//populate pulldown
	for (j=0; j<availableDatasets.length; j++) {
		datasetField.options[j] = new Option(availableDatasets[j], availableDatasets[j]);
	}
	
	//set the pulldown to whatever is currently selected
	datasetField.value = selectedDataset;
	
	
	console.log("Populated Datasets with " + availableDatasets.length + " options");
}

