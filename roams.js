//Width and height
var w = document.getElementById("visualization").width.baseVal.value;//1000;
var h = document.getElementById("visualization").height.baseVal.value;//700;
var padding = 30;
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
	svg.selectAll("rect")
	.data(rssiset)
	.enter()
	.append("rect")
	.attr("x", function(d) {
		return xScale(d[0]);
	})
	.attr("y", function(d) {
		return yScale(d[1]);
	})
	.attr("width", function(d) {
		//return rScale(d[1]);
		return 5;
		return 5;
	})
	.attr("height", function(d) {
		//return rScale(d[1]);
		return 5;
	})
	.attr("fill", function(d) {
		//return rScale(d[1]);
		
		var colors = ["green","yellow","orange","blue","brown","aqua","purple","cyan"];
		
		return colors[d[3]-1];
		
		switch(d[3])
		{
			case 8:
				return "green";
				break;
			case 9:
				return "yellow";
				break;
			case 10:
				return "orange";
				break;
			case 11:
				return "blue";
				break;
			case 12:
				return "brown";
				break;
			case 13:
				return "aqua";
				break;
			case 14:
				return "purple";
				break;
			case 15:
				return "cyan";
				break;
			default:
				return "grey";
		}
	})
	.attr("fill-opacity", function(d) {
		return rssiScale(d[2]);
		//return 1;
		//return d[2]/52;
	})
	/*.transition().duration(1000)
		.attr("x", function(d) {return 0 })
		.attr("y", function(d) {return 0 })
	*/
	;
	//-------------------------------------------------------------
	//Create circles
	//-------------------------------------------------------------
	svg.selectAll("circle")
	.data(dataset)
	.enter()
	.append("circle")
	.attr("cx", function(d) {
		return xScale(d[0]);
	})
	.attr("cy", function(d) {
		return yScale(d[1]);
	})
	.attr("r", function(d) {
		//return rScale(d[1]);
		return d[2];
	})
	.attr("fill", function(d) {
		//return rScale(d[1]);
		return "red";
	})
	.attr("fill-opacity", function(d) {
		//return rScale(d[1]);
		return .1;
	});



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
