

var barSpacing = 1;
var barPadding = 20;
var barWidth = 300;
var barHeight = 100;
var roamBarData;
var barYScale, barXScale, barAxis, svg, labels;

Array.max = function( array ){
    return Math.max.apply( Math, array );
};
Array.min = function( array ){
    return Math.min.apply( Math, array );
};



function init()
{
	svg = d3.select("#roamHist")
	.append("svg")
	.attr("width", barWidth)
		.attr("height", barHeight);
	
}
function makeScales()
{
	
	//create bar scales
	var countMin = Array.min(roamBarData.map(function(o){return o.count;}));
	var countMax = Array.max(roamBarData.map(function(o){return o.count;}));
	barYScale = d3.scale.log()
		.domain([countMin, countMax])
		.range([barPadding,barHeight-barPadding]);

	var roamMin = Array.min(roamBarData.map(function(o){return o.duration;}));
	var roamMax = Array.max(roamBarData.map(function(o){return o.duration;}));

	barXScale = d3.scale.linear()
		.domain([roamMin, roamMax])
		.range([barPadding,barWidth-barPadding]);
		
	//create axis
	barAxis = d3.svg.axis()
		.scale(barXScale)
		.orient("bottom")
		.ticks(5);

}

init();
redraw();
		
function redraw()
{
	roamBarData = rawData.roamhist;
	makeScales();
	//Create Bar element	
	bars = svg.selectAll("rect").data(roamBarData, function (d) { return d.id;});
	labels = svg.selectAll("text").data(roamBarData);
	
	bars.enter()
		.append("rect")
		.attr("x", function(d,i){ 
			return i*(barWidth/roamBarData.length);
		})
		.attr("y", function(d){
			return barHeight - barYScale(d.count) - barPadding;
		})
		.attr("width", barWidth/roamBarData.length - barSpacing)
		.attr("height", function(d){
			return barYScale(d.count);
		})
		.attr("fill", "red");
		
	bars.transition()
		.duration(1000)
		.attr("y", function(d){
			return barHeight - barYScale(d.count) - barPadding;
		})
		.attr("height", function(d){
			return barYScale(d.count);
		});
		/*
		rects.data(newData)
     .transition().duration(2000).delay(200)
     .attr("width", function(d) {return 20 * d; } )
     .attr("fill", newColor);
		*/
	svg.selectAll("text")
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
			var rectWidth = (barWidth / roamBarData.length);
			return (i * rectWidth) + rectWidth*.5 - barSpacing;
		})
		.attr("y", function(d) {
			return barHeight - barYScale(d.count) - 6;  //spacing above bar
		});

	labels.transition()
		.duration(0)
		.text(function(d) {
			//return d.count.toString();
			//var scaled = rssiScale(d.rssi_val)*10;
			//return rssiColorScale(Math.round(scaled)-1);
			return d.count.toString();
			//return Math.round(scaled.toString());
		});
	
	bars.exit()
		.remove();
		
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (barHeight - barPadding) + ")")
		.call(barAxis);
		
		
}