//Width and height
var w = document.getElementById("visualization").width.baseVal.value;//1000;
var h = document.getElementById("visualization").height.baseVal.value;//700;
var padding = 30;
var channelcolors = ["red","orange","yellow","green","blue","purple","cyan","lime", "royalblue"];
var svg;

//-------------------------------------------------------------
//Create scale functions
//-------------------------------------------------------------
var xScale = d3.scale.linear()
.domain([60, d3.max(cellset, function(d) { return d[0]; })])
.range([padding, w - padding * 2]);

var yScale = d3.scale.linear()
.domain([80, d3.max(cellset, function(d) { return d[1]; })])
.range([h - padding, padding]);

var rScale = d3.scale.linear()
.domain([0, d3.max(cellset, function(d) { return d[1]; })])
.range([2, 5]);

var rssiScale = d3.scale.linear()
//.domain([d3.min(cellset, function(d) { return d[2]; }), d3.max(cellset, function(d) { return d[2]; })])
//.domain([0, d3.max(cellset, function(d) { return d[2]; })])
.domain([0,100])
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
	for(var i=1; i<10; i++)
	{
		var numstring = i.toString();
		document.getElementById(numstring).style.color = channelcolors[i-1];
	}
	
	// load data, process it and draw it
	update ();
}


// called every time a form field has changed
function update () {
	
	var dataset = getChosenDataset(), // filename of the chosen dataset csv
	processedData; // the data while will be visualised
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
	redraw();
	
}

function redraw () {
		

	//-------------------------------------------------------------
	//Create cells	
	//-------------------------------------------------------------
	var cells = svg.selectAll("rect").data(rssiset);
	cells.enter()
		.append("rect")
		.attr("x", 				function(d) { return xScale(d[0]); })
		.attr("y", 				function(d) { return yScale(d[1]); })
		.attr("width", 			function(d) { return 4; })
		.attr("height", 		function(d) { return 5; })
		.attr("fill", 			function(d) { return channelcolors[d[3]-1]; })
		.attr("fill-opacity", 	function(d) { return rssiScale(d[2]); });
	
	
	//-------------------------------------------------------------
	//Create Roams
	//-------------------------------------------------------------
	
	var roams = svg.selectAll("circle").data(dataset),axes = getAxes();
	
	roams.enter()
		.insert("circle")
		.attr("cx", 			function(d) { return xScale(d[0]); })
		.attr("cy", 			function(d) { return yScale(d[1]); })
		.attr("r", 				function(d) { return d[2]; })
		.attr("fill", 			function(d) { return "red"; })
		.attr("fill-opacity", 	function(d) { return .1; });
	
	// remove points if we don't need them anymore
	
	// transition the points
	roams.transition().duration(1500).ease("exp-in-out")
		.style("opacity", 1)
		//.style("fill", function (d) { return colours[d.type.id]; }) // set fill colour from the colours array
		//.attr("r", function(d) { return rRange (d[axes.radiusAxis]); })
		//.attr("cx", function (d) { return xRange (d[axes.xAxis]); })
		//.attr("cy", function (d) { return yRange (d[axes.yAxis]); });
	
	
	roams.exit()
		.transition().duration(1500).ease("exp-in-out")
		//.attr("cx", function (d) { return xRange (d[axes.xAxis]); })
		//.attr("cy", function (d) { return yRange (d[axes.yAxis]); })
		.style("opacity", 0)
		.attr("r", 0)
		.remove();
	


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
document.getElementById("controls").addEventListener ("click", update, false);
document.getElementById("controls").addEventListener ("keyup", update, false);
