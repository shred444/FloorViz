
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

var piesvg = d3.select("#piechart")
	.append("svg")
    .attr("width", width)
    .attr("height", height)
	.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var piequery = 'SELECT du_id, count(*) as count, (select count(*) from roams WHERE roam_time BETWEEN \"' + timeRange.min.format(Date.SQL) + '\" AND \"' + timeRange.max.format(Date.SQL) + '\") as max FROM roams WHERE roam_time BETWEEN \"' + timeRange.min.format(Date.SQL) + '\" AND \"' + timeRange.max.format(Date.SQL) + '\" group by du_id order by count desc LIMIT 20;';
var pieurl = "jsonSQL.php?db=amz_bfi1&q=" + piequery;

d3.json(pieurl, function(error, piedata) {
	var sum=0;
	piedata.forEach(function(d) {
		d.count = +d.count;
		sum +=d.count;
	});

	//create other section
	var other = new Object();
	other.max = piedata[0].max;
	other.count = other.max - sum;
	other.du_id = "other";
	piedata.push(other);

	var g = piesvg.selectAll(".arc")
		.data(pie(piedata))
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
