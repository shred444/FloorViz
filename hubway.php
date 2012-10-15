<html>
<head>

	<script src="http://d3js.org/d3.v2.js"></script>
	<style>
	

	@import url(../style.css?20120427);

	#circle circle {
	  fill: none;
	  pointer-events: all;
	}

	.group path {
	  fill-opacity: .5;
	}

	path.chord {
	  stroke: #000;
	  stroke-width: .25px;
	}

	#circle:hover path.fade {
	  display: none;
	}

	</style>
	
	</head>
	<body>
	
	
	<div id="visualization"></div>
	<div id="myChord"></div>
<div id="txtHint"></div>
<script>
var myData;
function showUser(){
	
	if (window.XMLHttpRequest)	{// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	else {// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	xmlhttp.onreadystatechange=function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			//state is ready and data is good
			document.getElementById("txtHint").innerHTML=xmlhttp.responseText;
			myData = JSON.parse(xmlhttp.responseText);
			redraw();
		}
	}
	
	//call function to get data
	xmlhttp.open("GET","http://hubwaydatachallenge.org/api/v1/station/?format=json&username=shred444&api_key=fa798c85d5ad57a1c3010fa916953d9407596349",true);
	xmlhttp.send();
}

showUser();

var w = 500;
var h = 400;





		
function redraw(){
			
	
	xMin = Math.min.apply(Math, myData.objects.map(function(o){ return o.point.coordinates[0]; }));
	xMax = Math.max.apply(Math, myData.objects.map(function(o){ return o.point.coordinates[0]; }));
	var xScale = d3.scale.linear()
	.domain([xMin, xMax])
	.range([0,w]);
	
	yMin = Math.min.apply(Math, myData.objects.map(function(o){ return o.point.coordinates[1]; }));
	yMax = Math.max.apply(Math, myData.objects.map(function(o){ return o.point.coordinates[1]; }));
	var yScale = d3.scale.linear()
	.domain([yMin, yMax])
	.range([h,0]);
	

	var hub = d3.select("#visualization")
		.append("svg")
		.attr("width", w)
		.attr("height", h);		
			
	hub.selectAll("circle")
		.data(myData.objects)
		.enter()
		.append("circle")
		.attr("cx", function(d){
			return xScale(d.point.coordinates[0]);
		})
		.attr("cy", function(d){
			return yScale(d.point.coordinates[1]);
		})
		.attr("r", 5)
		.attr("fill", "red");
		
		
			
		
	var width = 720,
		height = 720,
		outerRadius = Math.min(width, height) / 2 - 10,
		innerRadius = outerRadius - 24;

	var formatPercent = d3.format(".1%");

	var arc = d3.svg.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius);

	var layout = d3.layout.chord()
		.padding(.04)
		.sortSubgroups(d3.descending)
		.sortChords(d3.ascending);

	var path = d3.svg.chord()
		.radius(innerRadius);

	var svg = d3.select("#myChord").append("svg")
		.attr("width", width)
		.attr("height", height)
	  .append("g")
		.attr("id", "circle")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	svg.append("circle")
		.attr("r", outerRadius);

	d3.csv("cities.csv", function(cities) {
	  d3.json("matrix.json", function(matrix) {

		// Compute the chord layout.
		layout.matrix(matrix);

		// Add a group per neighborhood.
		var group = svg.selectAll(".group")
			.data(layout.groups)
		  .enter().append("g")
			.attr("class", "group")
			.on("mouseover", mouseover);

		// Add a mouseover title.
		group.append("title").text(function(d, i) {
		  return cities[i].name + ": " + formatPercent(d.value) + " of origins";
		});

		// Add the group arc.
		var groupPath = group.append("path")
			.attr("id", function(d, i) { return "group" + i; })
			.attr("d", arc)
			.style("fill", function(d, i) { return cities[i].color; });

		// Add a text label.
		var groupText = group.append("text")
			.attr("x", 6)
			.attr("dy", 15);

		groupText.append("textPath")
			.attr("xlink:href", function(d, i) { return "#group" + i; })
			.text(function(d, i) { return cities[i].name; });

		// Remove the labels that don't fit. :(
		groupText.filter(function(d, i) { return groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength(); })
			.remove();

		// Add the chords.
		var chord = svg.selectAll(".chord")
			.data(layout.chords)
		  .enter().append("path")
			.attr("class", "chord")
			.style("fill", function(d) { return cities[d.source.index].color; })
			.attr("d", path);

		// Add an elaborate mouseover title for each chod.
		chord.append("title").text(function(d) {
		  return cities[d.source.index].name
			  + " ? " + cities[d.target.index].name
			  + ": " + formatPercent(d.source.value)
			  + "\n" + cities[d.target.index].name
			  + " ? " + cities[d.source.index].name
			  + ": " + formatPercent(d.target.value);
		});

		function mouseover(d, i) {
		  chord.classed("fade", function(p) {
			return p.source.index != i
				&& p.target.index != i;
		  });
		}
	  });
	});

	}

</script>



</body>
</html>