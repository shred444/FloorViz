

var width = 300,
    height = 300,
    radius = Math.min(width, height) / 2;


var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 50);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.count; });

var piesvg = d3.select("#piechart")
	.append("svg")
    .attr("width", width)
    .attr("height", height)
	.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

//first load
//pieRefresh();
	
function pieRefresh(minDuration,maxDuration){
	var piequery = 'SELECT du_id, count(*) as count, (select count(*) from roams WHERE roam_time BETWEEN \"' + timeRange.min.format(Date.SQL) + '\" AND \"' + timeRange.max.format(Date.SQL) + '\" AND duration BETWEEN ' + minDuration + ' AND ' + maxDuration + ') as max FROM roams WHERE roam_time BETWEEN \"' + timeRange.min.format(Date.SQL) + '\" AND \"' + timeRange.max.format(Date.SQL) + '\" AND duration BETWEEN ' + minDuration + ' AND ' + maxDuration + ' group by du_id order by count desc LIMIT 6;';
	var pieurl = "jsonSQL.php?db=amz_bfi1&q=" + piequery;

	console.log(pieurl);
	var piedata= [];
	d3.json(pieurl, function(error, piedata) {
		
		console.log("Pie Chart Update Received (" + minDuration + ", " + maxDuration + ")");

		
		var sum=0;
		piedata.forEach(function(d) {
			d.count = +d.count;
			sum +=d.count;
		});

		//create other section
		if(piedata.length >= 6){
			var other = new Object();
			other.max = piedata[0].max;
			other.count = other.max - sum;
			other.du_id = "other";
			piedata.push(other);
		}
		
		
		var myg = piesvg.selectAll(".arc")
			.data(pie(piedata));
			
		var g = myg.enter()
			.append("g")
			.attr("class", "arc");
		
		g.append("path")
			.attr("d", arc)
			.style("fill", function(d) { return color(d.data.du_id); });

		
		var labels = g.append("text")
			.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
			.attr("dy", ".35em")
			.style("text-anchor", "middle")
			.text(function(d) { return d.data.du_id; });
			
		/*piesvg.selectAll(".arc").exit()
			.remove();
		*/
		
		piesvg.selectAll(".arc")
			.data(pie(piedata))
			.exit()
				.remove();
				
				
		piesvg.selectAll("path")
			.data(pie(piedata))
			.transition()
				.duration(1000)
				.attr("d", arc);
			
			
		piesvg.selectAll("text")
			.data(pie(piedata))
			.transition()
				.duration(1000)
				.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
				.text(function(d) { return d.data.du_id; });
				
		piesvg.selectAll("text")
			.data(pie(piedata))
			.exit()
				.remove();
			
	});
}