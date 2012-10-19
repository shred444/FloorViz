var barSpacing = 1;
var barPadding = 20;
var barWidth = 300;
var barHeight = 100;
var roamBarData;
var barYScale, barXScale, barAxis2, svghist, labels, xAxis;

Array.max = function( array ){
    return Math.max.apply( Math, array );
};
Array.min = function( array ){
    return Math.min.apply( Math, array );
};



function init()
{
	svghist = d3.select("#roamHist")
	.append("svg")
	.attr("class", "barchart")
	.attr("width", barWidth)
		.attr("height", barHeight);
	
	svghist.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (barHeight - barPadding) + ")")
      .call(xAxis);
	
}
function makeScales(roamBarData)
{
	var numBars = roamBarData.length;
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
		
			
	xAxis = d3.svg.axis()
		.scale(barXScale)
		.ticks(numBars)
		.tickSubdivide(true)
		.orient("bottom");
}

init();
		
function histRefresh()
{
	
	var histquery = 'SELECT floor(duration/10)*10 as duration, count(*) as count FROM roams WHERE ' + filter.roams.where + ' GROUP BY floor(duration/10)*10;';
	var histurl = "jsonSQL.php?db=amz_bfi1&q=" + histquery;
	//console.log(histurl);
	
	var roamBarData= [];
	d3.json(histurl, function(error, roamBarData) {
		console.log("Histogram received with " + roamBarData.length + " data");
		
		makeScales(roamBarData);
			
		//Create Bar element	
		bars = svghist.selectAll(".bar").data(roamBarData);
		labels = svghist.selectAll("text.label").data(roamBarData);
		axis = svghist.selectAll(".x.axis");
		numBars = roamBarData.length;
		
		
		//BARS
		
		bars.enter()
			.append("rect")
			.attr("class", "bar")
			.attr("x", function(d,i){ 
				return i*(barWidth/roamBarData.length);
			})
			.attr("y", function(d){
				//return barHeight - barYScale(d.count) - barPadding;
				return barHeight - barPadding;
			})
			.attr("width", barWidth/roamBarData.length - barSpacing)
			.attr("height", function(d){
				//return barYScale(d.count);
				return 1;
			})
			.attr("fill", "red");
			
		bars.transition()
			.duration(1000)
			.attr("x", function(d,i){ 
				return i*(barWidth/roamBarData.length);
			})
			.attr("y", function(d){
				return barHeight - barYScale(d.count) - barPadding;
			})
			.attr("width", barWidth/roamBarData.length - barSpacing)
			.attr("height", function(d){
				return barYScale(d.count);
			});
			
		bars.exit().transition()
			.duration(1000)
			//.attr("fill-opacity", 0)
			.attr("x", function(d, i) {
				var rectWidth = (barWidth / roamBarData.length);
				return (i * rectWidth) + rectWidth*.5 - barSpacing + numBars;
			})
			.remove();
		
		
		//LABELS
		
		labels.enter()
			.append("text")
			.attr("class", "label")
			.attr("font-family", "helvetica")
			.attr("font-size", "8px")
			.attr("fill", "black")
			.attr("text-anchor", "middle")
			.text(function(d) {
				return d.count.toString();
			})
			.attr("x", function(d, i) {
				var rectWidth = (barWidth / roamBarData.length);
				return (i * rectWidth) + rectWidth*.5 - barSpacing;
			})
			.attr("y", function(d) {
				return barHeight - barYScale(d.count) - 6;  //spacing above bar
			});

		labels.transition()
			.duration(1000)
			.text(function(d) {
				return d.count.toString();
			})
			.attr("x", function(d, i) {
				var rectWidth = (barWidth / roamBarData.length);
				return (i * rectWidth) + rectWidth*.5 - barSpacing;
			})
			.attr("y", function(d) {
				return barHeight - barYScale(d.count) - 6;  //spacing above bar
			});
			
		labels.exit()
			.remove();
		
		axis.transition()
			.duration(1000)
			.call(xAxis);
		
	});
	
}