
var myDataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
			11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];

var barSpacing = 1;
var barPadding = 20;
var barWidth = 300;
var barHeight = 100;
var barData = rawData.hist;

//create bar scales
var countMin = Array.min(barData.map(function(o){return o.count;}));
var countMax = Array.max(barData.map(function(o){return o.count;}));
var barYScale = d3.scale.linear()
	.domain([countMin, countMax])
	.range([barPadding,barHeight-barPadding]);
	
var barXScale = d3.scale.linear()
	.domain([rssiMin, rssiMax])
	.range([barPadding,barWidth-barPadding]);
	
//create axis
var barAxis = d3.svg.axis()
    .scale(barXScale)
    .orient("bottom")
	.ticks(5);


//Create Bar element	
var bar = d3.select("#chart")
		.append("svg")
		.attr("width", barWidth)
		.attr("height", barHeight);
	
bar.selectAll("rect")
	.data(barData)
	//.data(myDataset)
	.enter()
	.append("rect")
	.attr("x", function(d,i){ 
		return i*(bar.attr("width")/barData.length);
	})
	.attr("y", function(d){
		return bar.attr("height") - barYScale(d.count) - barPadding;
	})
	.attr("width", bar.attr("width")/barData.length - barSpacing)
	.attr("height", function(d){
		return barYScale(d.count);
	})
	.attr("fill", function(d){
		var scaled = rssiScale(d.rssi_val)*10;
		return rssiColorScale(Math.round(scaled)-1);
		
	});
	
bar.selectAll("text")
	.data(barData)
	.enter()
	.append("text")
	.attr("font-family", "helvetica")
	.attr("font-size", "8px")
	.attr("fill", "black")
	.attr("text-anchor", "middle")
	.text(function(d) {
		//return d.count.toString();
		var scaled = rssiScale(d.rssi_val)*10;
		//return rssiColorScale(Math.round(scaled)-1);
		return Math.round(d.rssi_val.toString());
		//return Math.round(scaled.toString());
	})
	.attr("x", function(d, i) {
		var rectWidth = (bar.attr("width") / barData.length);
		return (i * rectWidth) + rectWidth*.5 - barSpacing;
	})
	.attr("y", function(d) {
		return bar.attr("height") - barYScale(d.count) - 10;
	});

bar.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(0," + (bar.attr("height") - barPadding) + ")")
	.call(barAxis);