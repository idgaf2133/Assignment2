
function init() {
  
    loadVisualization('Files/Diptheria/Diptheria.csv', 'Files/Diptheria/Diptheria_incidence.csv', 'blue', 'red'); // Load default visualization on start
}
window.onload = init;

function loadVisualization(file1, file2, color1, color2) {
    var w = 600;
    var h = 300;
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

