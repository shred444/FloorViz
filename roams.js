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
var showRSSI, showBR;
var padding = 50;
var drawingData;
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

var xScale = d3.scale.linear()
//.domain([60, d3.max(cellset, function(d) { return d[0]; })])
.domain(
	[	Math.min.apply(Math,rawData.rssi.map(function(o){return o.x;})),
		Math.max.apply(Math,rawData.rssi.map(function(o){return o.x;}))	
	])
	.rangeRound([padding, w - padding * 2]);

var yScale = d3.scale.linear()
.domain(
	[	Math.min.apply(Math,rawData.rssi.map(function(o){return o.y;})),
		Math.max.apply(Math,rawData.rssi.map(function(o){return o.y;}))
	])
	.range([h - padding *1.5, padding]);

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

var rssiColorScale = d3.scale.ordinal()
      .domain([0,1,2,3,4,5,6,7,8,9,10])
      .range(["#A50026", "#D73027", "#F46D43", "#FDAE61", "#FEE08B", "#D9EF8B", "#A6D96A", "#66BD63", "#1A9850", "#006837"]);
	  //0xA50026; 0xD73027; 0xF46D43; 0xFDAE61; 0xFEE08B; 0xD9EF8B; 0xA6D96A; 0x66BD63; 0x1A9850; 0x006837

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

	var selectedChannels = [];
	
	if(document.getElementById("rssi-checkbox").checked){
		//roams checkbox checked
		showRSSI = 1;
	}
	
	dataColumn = document.getElementById("dataColumn").value;
	console.log("Data Column: " + dataColumn);
	
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
	//rssiMin = rssi_avg - rssi_dev;
	//rssiMax = rssi_avg + rssi_dev;
	
	//reformat the scale???
	/*rssiScale = d3.scale.linear()
		.domain([rssiMin,rssiMax])
		.range([0, 1]);
	*/
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
	
	var processedData; 					// the data while will be visualised

	processedData = processData(rawData.rssi);
	drawingData = processedData;
	console.log("rssiMin="+rssiMin + "   rssiMax="+rssiMax);
	redraw();
	
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
	
	that = this;
	
	function cellFill(d) { 
		var scaled;
		//if(showRSSI)
			scaled = rssiScale(d[dataColumn])*10;
		//else //if(showBR)
			//scaled = rssiScale(d.br_val)*10;
		return rssiColorScale(Math.round(scaled)-1); 
	}

	//-------------------------------------------------------------
	//Create cells	
	//-------------------------------------------------------------
	var cells = svg.selectAll("rect").data(drawingData, function (d) { return d.id;});
	cells.enter()
		.append("rect")
		.attr("id",				function(d) { return "Cell_" + d.x + "-" + d.y;})
		.attr("x", 				function(d) { return xScale(d.x); })
		//.attr("class",			"level1")
		.attr("y", 				function(d) { return yScale(d.y); })
		.attr("width", 			10)//function(d) { return 4 * floor; })
		.attr("height", 		10)//function(d) { return 4 * floor; })
		.attr("fill", 			function(d) { return cellFill(d);})
		//.attr("fill", 			function(d) { return channelcolors[d.channel]; })
		//.attr("fill-opacity", 	function(d) { return rssiScale(d[dataColumn]); })
		//.on("mouseover", (d,i) -> that.show_details(d,i,this))
		//.on("mouseout", (d,i) -> that.hide_details(d,i,this));
		.append("svg:title");
		
	//mouseover title
	cells.select("title")
       .text(function(d) { return "x:"+d.x + " y:"+d.y +"rssi:"+d.rssi_val+"["+Math.round(rssiScale(d.br_val)*10) +"] br: " + d.br_val + " count:" +d.record_count; });
	/*		
	cells.filter(function(d) { return d.x in drawingData; })
       //.attr("class", function(d) { return "day q" + color(data[d]) + "-9"; })
		.select("title")
       .text(function(d) { return "hello: "; });		
	*/		
	cells.exit()
		//.transition()
		//.duration(1000)
		//.ease("linear")
		//.style("opacity", 0)
		.remove();

	
		
	//-------------------------------------------------------------
	//Create Roams
	//-------------------------------------------------------------
	
	
	var roamsChecked = document.getElementById("roam-checkbox").checked;
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
		.attr("r", 				function(d) { return d.duration; })
		.attr("fill", 			function(d) { return "red"; })
		.attr("fill-opacity", 	function(d) { return .3; });
	
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
	console.log("Redraw Complete");
	
}
// let's kick it all off!
init ();

//-------------------------------------------------------------
// Callbacks
//-------------------------------------------------------------
//document.getElementById("controls").addEventListener ("click", update, false);
//document.getElementById("controls").addEventListener ("keyup", update, false);


function populateDatasets (form){
    var result = ""; 
	selectedSite = document.getElementById(form).site.value;
	datasetField = document.getElementById(form).dataset;
	//selectField = document.getElementById(FieldID);
	datasetField.options.length = 0;
	//selectField.disabled = false;
	
	
	result = datasets[selectedSite];
	
	for (j=0; j<result.length; j++) {
		datasetField.options[j] = new Option(result[j], result[j]);
	}
	
	/*
    for (var i = 0; i < form.plotFam.length; i++) { 
        if (form.plotFam.options[i].selected) { 
            famName = form.plotFam.options[i].text; 
			if (families[famName]) {
				result = families[famName];
				
				for (j=0; j<result.length; j++) {
					selectField.options[selectField.length] = new Option(result[j], result[j]);
				}
			}
        } 
    }
	*/
	
	console.log("Populated Datasets");
}

