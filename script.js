/*
function init() {
    var w = 500;
    var h = 250;
    var padding = 30;

    var rowConverter = function(d) {
        return {
            date: new Date(+d.YEA, 0),  
            number: +d.Value
        };
    };

    // Load the first dataset and then the second dataset
    d3.csv("Files/Diptheria.csv", rowConverter)
        .then(function(data1) 
        {
            var dataset1 = data1;
            d3.csv("Files/Diptheria_incidence.csv", rowConverter)
                .then(function(data2) 
                {
                    var dataset2 = data2;

                    
                    var combinedData = dataset1.concat(dataset2);

                    var xScale = d3.scaleTime()
                        .domain([d3.min(combinedData, function(d) { return d.date; }), 
                                 d3.max(combinedData, function(d) { return d.date; })])
                        .range([padding, w - padding]);

                    var yScale = d3.scaleLinear()
                        .domain([0, d3.max(combinedData, function(d) { return d.number; })])
                        .range([h - padding, padding]);

                    var xAxis = d3.axisBottom()
                        .ticks(10)
                        .scale(xScale);

                    var yAxis = d3.axisLeft()
                        .ticks(5)
                        .scale(yScale);

                    var line = d3.line()
                        .x(function(d) { return xScale(d.date); })
                        .y(function(d) { return yScale(d.number); });

                    var svg = d3.select("#chart")
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h);

                    // Draw the line for the first dataset
                    svg.append("path")
                        .datum(dataset1)
                        .attr("class", "line")
                        .style("stroke", "red")  // Style the line color differently
                        .attr("d", line);

                    // Draw the line for the second dataset
                    svg.append("path")
                        .datum(dataset2)
                        .attr("class", "line")
                        .style("stroke", "blue")  // Another style for differentiation
                        .attr("d", line);

                    // Add the X Axis
                    svg.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(0," + (h - padding) + ")")
                        .call(xAxis);

                    // Add the Y Axis
                    svg.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(" + padding + ",0)")
                        .call(yAxis);
                });
        });

    
}

window.onload = init;
*/
function init() {
    d3.select("#chart").select("svg").remove();
    loadVisualization('Files/Diptheria.csv', 'Files/Diptheria_incidence.csv', 'blue', 'red'); // Load default visualization on start
}
window.onload = init;

function loadVisualization(file1, file2, color1, color2) {
    var w = 500;
    var h = 250;
    var padding = 30;

    var rowConverter = function(d) {
        return {
            date: new Date(+d.YEA, 0),
            number: +d.Value
        };
    };

    // Clear existing SVG to make room for a new one
    d3.select("#chart").select("svg").remove();

    var svg = d3.select("#chart")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

    Promise.all([
        d3.csv(file1, rowConverter),
        d3.csv(file2, rowConverter)
    ]).then(function(data) {
        var dataset1 = data[0];
        var dataset2 = data[1];

        var combinedData = dataset1.concat(dataset2);

        var xScale = d3.scaleTime()
            .domain([d3.min(combinedData, d => d.date), d3.max(combinedData, d => d.date)])
            .range([padding, w - padding]);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(combinedData, d => d.number)])
            .range([h - padding, padding]);

        var xAxis = d3.axisBottom().scale(xScale).ticks(10);
        var yAxis = d3.axisLeft().scale(yScale).ticks(5);

        var line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.number));

        // Draw the line for the first dataset
        svg.append("path")
            .datum(dataset1)
            .attr("class", "line")
            .style("stroke", color1)
            .style("fill", "none")  
            .attr("d", line);

        // Draw the line for the second dataset
        svg.append("path")
            .datum(dataset2)
            .attr("class", "line")
            .style("fill", "none")  
            .style("stroke", color2)
            .attr("d", line);

        // Append X and Y axes
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${h - padding})`)
            .call(xAxis);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${padding},0)`)
            .call(yAxis);
    });
}

