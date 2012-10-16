

var barSpacing = 1;
var barPadding = 20;
var barWidth = 300;
var barHeight = 100;
var roamBarData = rawData.roamhist;

//create bar scales
var countMin = Array.min(roamBarData.map(function(o){return o.count;}));
var countMax = Array.max(roamBarData.map(function(o){return o.count;}));
var barYScale = d3.scale.log()
	.domain([countMin, countMax])
	.range([barPadding,barHeight-barPadding]);

var roamMin = Array.min(rawData.roamhist.map(function(o){return o.duration;}));
var roamMax = Array.max(rawData.roamhist.map(function(o){return o.duration;}));

var barXScale = d3.scale.linear()
	.domain([roamMin, roamMax])
	.range([barPadding,barWidth-barPadding]);
	
//create axis
var barAxis = d3.svg.axis()
    .scale(barXScale)
    .orient("bottom")
	.ticks(5);


//Create Bar element	
var bar = d3.select("#roamHist")
		.append("svg")
		.attr("width", barWidth)
		.attr("height", barHeight);
	
bar.selectAll("rect")
	.data(roamBarData)
	//.data(myDataset)
	.enter()
	.append("rect")
	.attr("x", function(d,i){ 
		return i*(bar.attr("width")/roamBarData.length);
	})
	.attr("y", function(d){
		return barHeight - barYScale(d.count) - barPadding;
	})
	.attr("width", barWidth/roamBarData.length - barSpacing)
	.attr("height", function(d){
		return barYScale(d.count);
	})
	.attr("fill", "red");
	
bar.selectAll("text")
	.data(roamBarData)
	.enter()
	.append("text")
	.attr("font-family", "helvetica")
	.attr("font-size", "8px")
	.attr("fill", "black")
	.attr("text-anchor", "middle")
	.text(function(d) {
		//return d.count.toString();
		//var scaled = rssiScale(d.rssi_val)*10;
		//return rssiColorScale(Math.round(scaled)-1);
		return d.count.toString();
		//return Math.round(scaled.toString());
	})
	.attr("x", function(d, i) {
		var rectWidth = (bar.attr("width") / roamBarData.length);
		return (i * rectWidth) + rectWidth*.5 - barSpacing;
	})
	.attr("y", function(d) {
		return barHeight - barYScale(d.count) - 6;  //spacing above bar
	});

bar.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(0," + (barHeight - barPadding) + ")")
	.call(barAxis);