
function init()
{
var w = 1000;
var h = 500;
var padding = 55;

 // Select the body element and append an SVG container


 

var rowConverter = function(d) {
    return {
        date: new Date(+d.year, (+d.month - 1)),
        number: +d.number
    };
}


d3.csv("Unemployment_78-95.csv", rowConverter)
    .then(function(data) 
        {
     var dataset = data;
     lineChart(dataset);

     console.table(dataset, ["date", "number"]);
     });

function lineChart(dataset){

    var xScale = d3.scaleTime()
    .domain([
         d3.min(dataset, function(d) { return d.date; }),
         d3.max(dataset, function(d) { return d.date; })
     ])
    .range([padding, w]);

      var yScale = d3.scaleLinear()
     .domain([0, d3.max(dataset, function(d) { return d.number; })])
     .range([h-padding, 0]);


     				
	var xAxis = d3.axisBottom()
                 .ticks(10)
                .scale(xScale);
                
                
     
     var yAxis = d3.axisLeft()
                 .ticks(10)
                .scale(yScale);

    
    

     var line = d3.line()
			.x(function(d) { return xScale(d.date); })
			.y(function(d) { return yScale(d.number); });

    

     area = d3.area()
             
            .x(function(d) { return xScale(d.date); })
            .y0(function() { return yScale.range()[0]; })
            .y1(function(d) { return yScale(d.number); });

            var svg = d3.select("#chart")
            .append("svg")
            .attr("width", w)
            .attr("height", h);


            svg.append("path")
                .datum(dataset)
                .attr("class", "line")
                .attr("d", line);
            
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + (h - padding) + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + padding + ",0)")
                .call(yAxis);
            /*

            svg.append("line")
                .attr("class", "line halfMilMark")
                .attr("x1", padding)
                .attr("x2", w)
                .attr("y1", yScale(500000))
                .attr("y2", yScale(500000));

            //Label 350 ppm line
            svg.append("text")
                .attr("class", "halfMillLabel")
                .attr("x", padding + 10)
                .attr("y", yScale(500000) - 7)
                .text("Half a million unemployed");
         */

    

};
}

    window.onload = init;