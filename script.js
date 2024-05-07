function init()
{
    // Set the width and height of the SVG container
    var w = 600;
    var h = 300;
    var padding = 55; // Padding for the axes and chart area

var svg = d3.select("#chart")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

var xScale = d3.scaleTime()
    .domain([
        d3.min(dataset, function(d) { return d.date; }),
        d3.max(dataset, function(d) { return d.date; })
    ])
    .range([padding, w]);

var yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, function(d) { return d.number; })])
    .range([h - padding, 0]);

// Define x and y axes
var xAxis = d3.axisBottom()
    .ticks(10)
    .scale(xScale);

var yAxis = d3.axisLeft()
    .ticks(10)
    .scale(yScale);

// Define line and area functions
var line = d3.line()
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(d.number); });


// Append SVG container to the #chart element
var svg = d3.select("#chart")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

// Append area path
svg.append("path")
    .datum(dataset)
    .attr("class", "line")
    .attr("d", line);

// Append x-axis
svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + (h - padding) + ")")
    .call(xAxis);

// Append y-axis
svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + padding + ",0)")
    .call(yAxis);



    const parseDate = d3.timeParse("%Y");

    let data;
    // Function to convert CSV row data into the desired format
    var rowConverter = function(d) {
        return {
            year: parseDate(d.Year),
            value: +d.Value,
            variable: d.Variable
        };
    }

    // Load the CSV data and execute the callback function
    d3.csv("nibba.csv", rowConverter)
        .then(function(loadedData) {
            // Pass the loaded dataset to the lineChart function
            data = loadedData;
           updateChart('ACATHEPB');  
            // Log the dataset to the console
            //console.table(dataset, ["date", "number"]);
        });

    
    function updateChart(varCode){

        var filteredData = data.filter(function(d) {
            return d.varCode === varCode && d.year.getFullYear() >= 1993;
        });
    
        x.domain([parseDate('1993'), parseDate('2023')]);
        y.domain([0, d3.max(filteredData, function(d) {
            return d.value;
        })]);
    
        xAxis.call(d3.axisBottom(x));
        yAxis.call(d3.axisLeft(y));
    
        line.datum(filteredData)
            .attr("d", d3.line()
                .x(function(d) {
                    return x(d.year);
                })
                .y(function(d) {
                    return y(d.value);
                })
            );
    
    }
}

// Call the init function when the window loads
window.onload = init;
