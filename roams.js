if (!window.console) console = {};
console.log = console.log || function(){};
console.warn = console.warn || function(){};
console.error = console.error || function(){};
console.info = console.info || function(){};

//Width and height
var w = document.getElementById("visualization").width.baseVal.value;//1000;
var h = document.getElementById("visualization").height.baseVal.value;//700;
var padding = 30;
var drawingData;
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

//-------------------------------------------------------------
//Create scale functions
//-------------------------------------------------------------
var myXMax = 0, myXMin = 9999;
	rawData.rssi.forEach (function (data, index) {
		if(Number(data.x)>myXMax){
			myXMax=data.x;
		}
		if(Number(data.x)<myXMin){
			myXMin=data.x;
		}
	});
var myYMax = 0, myYMin = 9999;
	rawData.rssi.forEach (function (data, index) {
		if(Number(data.y)>myYMax){
			myYMax=data.y;
		}
		if(Number(data.y)<myYMin){
			myYMin=data.y;
		}
	});

var xScale = d3.scale.linear()

//.domain([60, d3.max(cellset, function(d) { return d[0]; })])
//.domain([60,d3.max(drawingData, function(d) { return d[0]; })])
//.domain([60,400])
/*.domain(
	[	Math.min.apply(Math,rawData.rssi.map(function(o){return o.x;})),
		Math.max.apply(Math,rawData.rssi.map(function(o){return o.x;}))
	])
*/
.domain([myXMin,myXMax])
.range([padding, w - padding * 2]);

var yScale = d3.scale.linear()
//.domain([80, d3.max(cellset, function(d) { return d[1]; })])
//.domain([60,d3.max(drawingData, function(d) { return d[1]; })])
//.domain([60,200])
//.domain([0,120])
/*.domain(
	[	Math.min.apply(Math,rawData.rssi.map(function(o){return o.y;})),
		Math.max.apply(Math,rawData.rssi.map(function(o){return o.y;}))
	])
*/
.domain([myYMin,myYMax])
.range([h - padding, padding]);

var rScale = d3.scale.linear()
//.domain([0, d3.max(cellset, function(d) { return d[1]; })])
//.domain([0, d3.max(drawingData, function(d) { return d[3]; })])
.domain([0,100])
.range([2, 5]);

var rssiScale = d3.scale.sqrt()
//.domain([d3.min(cellset, function(d) { return d[2]; }), d3.max(cellset, function(d) { return d[2]; })])
//.domain([0, d3.max(cellset, function(d) { return d[2]; })])
//.domain([30,80])
//.domain([18,60])
.domain([7,60])
.range([0, 1]);

//-------------------------------------------------------------
// Create All Axis
//-------------------------------------------------------------
//Define X axis
var xAxis = d3.svg.axis()
.scale(xScale)
.orient("bottom")
.ticks(5);

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
	//Create X axis
	//-------------------------------------------------------------
	svg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(0," + (h - padding) + ")")
	.attr("fill", "grey")
	.call(xAxis);

	//-------------------------------------------------------------
	//Create Y axis
	//-------------------------------------------------------------
	svg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(" + padding + ",0)")
	.attr("fill", "grey")
	.call(yAxis);

	//-------------------------------------------------------------
	//Create Y axisR
	//-------------------------------------------------------------
	svg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(" + (w - padding - 30) + ",0)")
	.attr("fill", "grey")
	.call(yAxisR);

	/*
	vis = d3.select("#visualisation");

	// add in the x axis
	vis.append("svg:g") // container element
		.attr("class", "x axis") // so we can style it with CSS
		.attr("transform", "translate(0," + HEIGHT + ")") // move into position
		.call(xAxis); // add to the visualisation

	// add in the y axis
	vis.append("svg:g") // container element
		.attr("class", "y axis") // so we can style it with CSS
		.call(yAxis); // add to the visualisation
	*/
	
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
		
	//get selected channels from form
	/*var channel1 = document.getElementById("channel-158").checked;
	var channel2 = document.getElementById("channel-153").checked;
	var channel3 = document.getElementById("channel-149").checked;
	var channel4 = document.getElementById("channel-161").checked;
	*/
	var selectedChannels = [];
	
	rawData.channels.forEach (function (chan, index) {
		var checked = document.getElementById("channel-" + chan.channel).checked;
		if(checked)
			selectedChannels.push(Number(chan.channel));
	});
	
	document.getElementById("dataDetails").innerHTML=processed.length + "/" + data.length + "   " + selectedChannels;

	
	data.forEach (function (data, index) {
		var coaster,
			className = "";
			
			/*if(	((data.channel == 158) && channel1) ||
				((data.channel == 153) && channel2) ||
				((data.channel == 149) && channel3) ||
				((data.channel == 161) && channel4)
			){*/
			
			
			
			
			
			if(selectedChannels.indexOf(Number(data.channel)) >=0)
			{
			
			//rawData.channels.map(function(o){return o.channel;}).indexOf("153") 
			
			/*if(	((data.channel == 1) && document.getElementById("channel-1").checked) ||
				((data.channel == 2) && document.getElementById("channel-2").checked) ||
				((data.channel == 3) && document.getElementById("channel-3").checked) ||
				((data.channel == 4) && document.getElementById("channel-4").checked) ||
				((data.channel == 5) && document.getElementById("channel-5").checked) ||
				((data.channel == 6) && document.getElementById("channel-6").checked) ||
				((data.channel == 7) && document.getElementById("channel-7").checked) ||
				((data.channel == 8) && document.getElementById("channel-8").checked)
			){
			*/
		//if (!(cullDirty && isDirty(data))) { // don't process it if it's dirty and we want to cull dirty data
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
			processed.push (coaster); // add the coaster to the outputs
		//}
		}else{
			var temp;
			temp++;
			//not a selected channel
	}
	});
	
	
	//document.getElementById("dataDetails").innerHTML=processed.length + "/" + data.length + "   " + channel1 + channel2 + channel3 + channel4;

	return processed; // only contains coasters we're interested in visualising
}

// called every time a form field has changed
function update () {
	//alert("updating");
	//var dataset = getChosenDataset(); 	// filename of the chosen dataset csv
	var processedData; 					// the data while will be visualised
	// if the dataset has changed from last time, load the new csv file
	/*
	if (dataset != currentDataset) {
		d3.csv("data/" + dataset + ".csv", function (data) {
			// process new data and store it in the appropriate variables
			rawData = data;
			processedData = processData(data);
			currentDataset = dataset;
			generateTypesList(processedData);
			drawingData = cullUnwantedTypes(processedData);
			redraw();
		});
		} else {
		// process data based on the form fields and store it in the appropriate variables
		processedData = processData(rawData);
		drawingData = cullUnwantedTypes(processedData);
	}
	*/

	processedData = processData(rawData.rssi);
	drawingData = processedData;
	//makeScales();
	redraw();
	
}

function makeScales()
{
	
	var myXMax = 0, myXMin = 9999;
	rawData.rssi.forEach (function (data, index) {
		if(Number(data.x)>myXMax){
			myXMax=data.x;
		}
		if(Number(data.x)<myXMin){
			myXMin=data.x;
		}
	});
	
	xScale = d3.scale.linear()
	//.domain([60, d3.max(cellset, function(d) { return d[0]; })])
	//.domain([60,d3.max(drawingData, function(d) { return d[0]; })])
	//.domain([60,400])
	/*.domain(
		[	Math.min.apply(Math,rawData.rssi.map(function(o){return o.x;})),
			Math.max.apply(Math,rawData.rssi.map(function(o){return o.x;}))
		])
	*/
	.domain([myXMin,myXMax])
	.range([padding, w - padding * 2]);
	
	var myYMax = 0, myYMin = 9999;
	rawData.rssi.forEach (function (data, index) {
		if(Number(data.y)>myYMax){
			myYMax=data.y;
		}
		if(Number(data.y)<myYMin){
			myYMin=data.y;
		}
	});
	
	yScale = d3.scale.linear()
	//.domain([60, d3.max(cellset, function(d) { return d[0]; })])
	//.domain([60,d3.max(drawingData, function(d) { return d[0]; })])
	//.domain([60,400])
	/*.domain(
		[	Math.min.apply(Math,rawData.rssi.map(function(o){return o.x;})),
			Math.max.apply(Math,rawData.rssi.map(function(o){return o.x;}))
		])
	*/
	.domain([myYMin,myYMax])
	.range([padding, w - padding * 2]);
	xAxis = d3.svg.axis()
	.scale(xScale)
	.orient("bottom")
	.ticks(5);

	//Define Y axis
	yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left")
	.ticks(5);
	console.log("making scales X:" + myXMin + "," + myXMax + "  Y:" + myYMin + "," + myYMax);
}

function redraw () {
	/*
	var grid = svg.selectAll("line.vertical").data(drawingData);
	grid.enter()
		.append("svg:line")
		.attr("x1", 1)
		.attr("y1", 1)
		.attr("x2", 100)
		.attr("y2", 100)
		.style("stroke-width", 2);
	*/
	/*
	//-------------------------------------------------------------
	//Create traffic	
	//-------------------------------------------------------------
	var traffic = svg.selectAll("rect").data(rawData.traffic, function (d) { return d.id;});
	traffic.enter()
		.append("rect")
		.attr("x", 				function(d) { return xScale(d.x); })
		.attr("y", 				function(d) { return yScale(d.y); })
		.attr("width", 			function(d) { return 4; })
		.attr("height", 		function(d) { return 5; })
		.attr("fill", 			function(d) { return "black"; })
		.attr("fill-opacity", 	function(d) { return rssiScale(d.records); });
	
	
	traffic.exit()
		//.transition()
		//.duration(1000)
		//.ease("linear")
		//.style("opacity", 0)
		.remove();
		*/
	
	

	//-------------------------------------------------------------
	//Create cells	
	//-------------------------------------------------------------
	var cells = svg.selectAll("rect").data(drawingData, function (d) { return d.id;});
	cells.enter()
		.append("rect")
		.attr("x", 				function(d) { return xScale(d.x); })
		.attr("y", 				function(d) { return yScale(d.y); })
		.attr("width", 			function(d) { return 4; })
		.attr("height", 		function(d) { return 5; })
		.attr("fill", 			function(d) { return channelcolors[d.channel]; })
		.attr("fill-opacity", 	function(d) { return rssiScale(d.rssi_val); });
		
	
	cells.exit()
		//.transition()
		//.duration(1000)
		//.ease("linear")
		//.style("opacity", 0)
		.remove();
	
		
		
	
	//-------------------------------------------------------------
	//Create Roams
	//-------------------------------------------------------------
	
	
	var roamsChecked = document.getElementById("roams").checked;
	var roamData = [];
	if(roamsChecked)
	{
		roamData = rawData.roams; 
	}
	
	var roams = svg.selectAll("circle").data(roamData, function (d) {return d.roam_id;});
	
	roams.enter()
		.append("circle")
		//.attr("transform", translate)
		.attr("cx", 			function(d) { return xScale(d.x); })
		.attr("cy", 			function(d) { return yScale(d.y); })
		.attr("r", 				function(d) { return 5; })
		.attr("fill", 			function(d) { return "red"; })
		.attr("fill-opacity", 	function(d) { return .1; });
	
	/*
	roams.transition()
		.duration(3000)
		//.ease("cubic-in-out")
		.ease("elastic", 2, .45)
		.delay(function(d) { return Math.random() * 1000; })
		.attr("visibility", "visible")
		.attr("r", 5);
		//.attr("cx", 0)
		//.attr("cy", 0)
		//.style("fill", function (d) { return colours[d.type.id]; }) // set fill colour from the colours array
		//.attr("r", function(d) { return rRange (d[axes.radiusAxis]); })
		//.attr("cx", function (d) { return xRange (d[axes.xAxis]); })
		//.attr("cy", function (d) { return yRange (d[axes.yAxis]); });
	*/
	
	roams.exit()
		.transition()
			//.duration(1000)
			//.ease("cubic-in-out")
			//.delay(function(d) { return Math.random() * 1000; })
			//.attr("cx", function (d) { return xRange (d[axes.xAxis]); })
			//.attr("cy", function (d) { return yRange (d[axes.yAxis]); })
			//.style("opacity", 0)
			.remove();
	
	
	// remove points if we don't need them anymore
	
	// transition the points
	//cells.transition().duration(1000).ease("exp-in-out")
	//	.style("opacity", 1)
		//.style("fill", function (d) { return colours[d.type.id]; }) // set fill colour from the colours array
		//.attr("r", function(d) { return rRange (d[axes.radiusAxis]); })
		//.attr("cx", function (d) { return xRange (d[axes.xAxis]); })
		//.attr("cy", function (d) { return yRange (d[axes.yAxis]); });
	
	
	


	/*
		//-------------------------------------------------------------
		//Create labels
		//-------------------------------------------------------------
		svg.selectAll("text")
		.data(dataset)
		.enter()
		.append("text")
		.text(function(d) {
		return d[0] + "," + d[1];
		})
		.attr("x", function(d) {
		return xScale(d[0]);
		})
		.attr("y", function(d) {
		return yScale(d[1]);
		})
		.attr("font-family", "sans-serif")
		.attr("font-size", "10px")
		.attr("fill", "black");
		//end labels
	*/
	
	
}
// let's kick it all off!
init ();

//-------------------------------------------------------------
// Callbacks
//-------------------------------------------------------------
//document.getElementById("controls").addEventListener ("click", update, false);
//document.getElementById("controls").addEventListener ("keyup", update, false);
