var data = rawData.hist;//[4, 8, 15, 16, 23, 42];


var chart = d3.select("#barchart")
    //.attr("class", "barchart")
    .attr("width", 420)
	.attr("height", 140)
	.append("g")
	.attr("transform", "translate(10,15)");

var x = d3.scale.linear()
    .domain([0, 100])
    .range([0, 420]);
	
 var y = d3.scale.ordinal()
    .domain(data)
    .rangeBands([0, 120]);

//Draw grid lines
chart.selectAll("line")
    .data(x.ticks(10))
  .enter().append("line")
    .attr("x1", x)
    .attr("x2", x)
    .attr("y1", 0)
    .attr("y2", 120)
    .style("stroke", "#ccc");

chart.selectAll(".rule")
    .data(x.ticks(10))
  .enter().append("text")
    .attr("class", "rule")
    .attr("x", x)
    .attr("y", 0)
    .attr("dy", -3)
    .attr("text-anchor", "middle")
    .text(String);

//draw y axis line
chart.append("line")
    .attr("y1", 0)
    .attr("y2", 120)
    .style("stroke", "#000");	

//draw bars
chart.selectAll("rect")
		.data(data, function (d) { return d.id;})
		//.data(data)
	.enter().append("rect")
		//.attr("class", "bar")
		.attr("y", y)
		.attr("width", function(d) { return d.percent; })
		.attr("height", y.rangeBand());

//draw text
chart.selectAll("text")
		.data(data)
	.enter().append("text")
		.attr("x", x)
		.attr("y", function(d) { return y(d) + y.rangeBand() / 2; })
		.attr("dx", -3) // padding-right
		.attr("dy", ".35em") // vertical-align: middle
		.attr("text-anchor", "end") // text-align: right
		.text(String);
		
