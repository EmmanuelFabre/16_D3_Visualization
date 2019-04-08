///////////Define and establish SVG/Chart area///////////////
//define svg dimensions
var svgWidth = 1200;
var svgHeight = 900;

//define plot margins
var plotMargins = {
	top: 20,
	bottom: 50,
	left: 50,
	right: 20
};
//define plot dimensions
var plotWidth = svgWidth - plotMargins.left - plotMargins.right;
var plotHeight = svgHeight - plotMargins.top - plotMargins.bottom;

//Select the tag to append SVG area to. Est the svg by appending to svg
var svg = d3
	.select("p")			
	.append("svg")
	.attr("height", svgHeight)
	.attr("width", svgWidth)
	.style("background-color", '43464c');
//append a group to the svg area, and shift/translate it to the margins
//g element provides reference point for adding our axis
var plotGroup = svg.append("g")			
	.attr("transform", `translate(${plotMargins.left}, ${plotMargins.top})`)

//Initial Parameters
var chosenXAxis = "obesity";
var chosenYAxis = "income";

// function used for updating x-scale var upon click on axis label
function getXScale(healthData, chosenXAxis) {
	console.log("first funct getXScale works");
	//create xScale (which translate data values to pixel values)
	var xScale = d3.scaleLinear()
		.domain([d3.min(healthData, d => d[chosenXAxis]) * 0.9,
			d3.max(healthData, d => d[chosenXAxis]) * 1.1
			])
		.range([0, plotWidth]);

	return xScale;
}


// function used for updating y-scale var upon click on axis label
function getYScale(healthData, chosenYAxis) {
 	console.log("second funct getYScale works");
	// create yScale 
 	var yScale = d3.scaleLinear()
		.domain(d3.extent(healthData, function (d) { return d.income; }))
 		.range([plotHeight * 0.95, 0]);
 	return yScale;
 }



//function used for updating circles group with new tooltip
function updateTool(chosenXAxis, circlesGroup) {
	console.log("third funct updateTool works");

	var label = (chosenXAxis === "obesity") ? "Obesity" : "Income"  

	var toolTip = d3.tip()
		.attr("class", "tooltip")
		.offset([90, -10])
		.html(d => `${"Income $" + d.income}<br>${label} ${d[chosenXAxis]}`);

	circlesGroup.call(toolTip);

	circlesGroup.on("mouseover", function(data) {
		toolTip.show(data, this);  	//adding 'this' allowed tooltip to work 
	})								//'this' got rid of 'targetel.getScreenCTM is not a func' error
		.on("mouseout", function(data, index) {
			toolTip.hide(data);
		});

	return circlesGroup;
}



//load the data from the csv
d3.csv("assets/data/data.csv").then(healthData => {		
	console.log(healthData);
	//parse data
	healthData.forEach(data => {
		data.income = +data.income;
		data.obesity = +data.obesity;
	});

	//xScale function above csv import
	var xScale = getXScale(healthData, chosenXAxis);
	//yScale functions 									
	var yScale = getYScale(healthData, chosenYAxis);

	//create initial axis functions
	var bottomAxis = d3.axisBottom(xScale);
	var leftAxis = d3.axisLeft(yScale);

	//append x axis 
	var xAxis = plotGroup.append("g")
		.attr("transform", `translate(0, ${plotHeight})`)
		.call(bottomAxis);

	//append y axis
	plotGroup.append("g")
		.call(leftAxis);
	//append initial circles
	var circlesGroup = plotGroup.selectAll("circle")
		.data(healthData)
		.enter()
		.append("circle")
	    .attr("cx", d => xScale(d[chosenXAxis]))
	    .attr("cy", d => yScale(d.income))
	    .attr("r", 20)
	    .attr("fill", "blue")
	    .attr("opacity", ".5");

	//create a group for 2-axis labels
	var labelsGroup = plotGroup.append("g")
		.attr("transform", `translate(${plotWidth / 2}, ${plotHeight + 20})`);

	//label and append X axis
	var obesityLabel = labelsGroup.append("text")
		.attr("x", 0)
		.attr("y", 20)			
		.attr("value", "obesity")
		.classed("inactive", true)	
		.text("Obesity Rate");		

	//label and append y axis
	plotGroup.append("text")
		.attr("transform", "rotate(-90)")
	    .attr("y", 0 - plotMargins.left)
	    .attr("x", 0 - (plotHeight / 2))
	    .attr("dy", "1em")
	    .classed("inactive", true)
	    .text("Income");		

	//updateTool function above the csv import
	var circlesGroup = updateTool(chosenXAxis, circlesGroup);


		});
