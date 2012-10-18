<!DOCTYPE html>
<meta charset="utf-8">
<style>

body {
  font: 10px sans-serif;
}

.arc path {
  stroke: #fff;
}

</style>
<body>
<script src="http://d3js.org/d3.v3.min.js"></script>
	<script src="date.js"></script>
<script>

var timeRange = new Object();
	timeRange.now = new Date();
	timeRange.min = new Date();
	timeRange.max = new Date();
	timeRange.min.setDate(timeRange.now.getDate()-4);
	timeRange.max.setDate(timeRange.now.getDate()-3);

var width = 960,
    height = 500,
    radius = Math.min(width, height) / 2;


var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 70);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.count; });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	var query = 'SELECT du_id, count(*) as count, (select count(*) from roams WHERE roam_time BETWEEN \"' + timeRange.min.format(Date.SQL) + '\" AND \"' + timeRange.max.format(Date.SQL) + '\") as max FROM roams WHERE roam_time BETWEEN \"' + timeRange.min.format(Date.SQL) + '\" AND \"' + timeRange.max.format(Date.SQL) + '\" group by du_id order by count desc LIMIT 20;';
d3.json("jsonSQL.php?db=amz_bfi1&q=" + query, function(error, data) {
var sum=0;
  data.forEach(function(d) {
    d.count = +d.count;
	sum +=d.count;
  });
  
  
	
//create other section
var total = data[0].max;
var other = total - sum;

var otherObject = new Object();
otherObject.count = other;
otherObject.du_id = "other";
otherObject.max = total;

data.push(otherObject);

  var g = svg.selectAll(".arc")
      .data(pie(data))
    .enter().append("g")
      .attr("class", "arc");

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.du_id); });

  g.append("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.data.du_id; });

});

</script>