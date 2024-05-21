

function init() {
  
    loadVisualization('Files/Diptheria/Diptheria.csv', 'Files/Diptheria/Diptheria_incidence.csv', 'blue', 'red', 'DTP'); // Load default visualization on start
}
window.onload = init;

function loadVisualization(file1, file2, color1, color2, disease) {
    var w = 500;
    var h = 250;
    var padding = 30;

    // Row converter remains the same
    var rowConverter = function(d) {
        return {
            date: new Date(+d.YEA, 0),
            number: +d.Value
        };
    };

    // Remove any existing SVG
    d3.select("#chart").select("svg").remove();

    var svg = d3.select("#chart")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

    Promise.all([
        d3.csv(file1, rowConverter),
        d3.csv(file2, rowConverter)
    ]).then(function(data) {
        var dataset1 = data[0]; // Assuming this is immunization rates
        var dataset2 = data[1]; // Assuming this is incidence rates

        var xScale = d3.scaleTime()
            .domain([d3.min(dataset1.concat(dataset2), d => d.date), d3.max(dataset1.concat(dataset2), d => d.date)])
            .range([padding, w - padding]);
            
      var minValue = d3.min(dataset1, d => d.number);
        var yScaleLeft = d3.scaleLinear() // For immunization rates
            .domain([Math.max(0, minValue - 10), 100]) // Start from a value slightly lower than the minimum
            .range([h - padding, padding]);

        var yScaleRight = d3.scaleLinear() // For incidence rates
            .domain([0, d3.max(dataset2, d => d.number)]) // Max of incidence rates
            .range([h - padding, padding]);

        var xAxis = d3.axisBottom().scale(xScale).ticks(10);
        var yAxisLeft = d3.axisLeft().scale(yScaleLeft).ticks(6);
        var yAxisRight = d3.axisRight().scale(yScaleRight).ticks(4); // Right Y-axis

        var lineLeft = d3.line() // Line for the left Y-axis data
            .x(d => xScale(d.date))
            .y(d => yScaleLeft(d.number));

        var lineRight = d3.line() // Line for the right Y-axis data
            .x(d => xScale(d.date))
            .y(d => yScaleRight(d.number));

        // Draw the line for the first dataset
        svg.append("path")
            .datum(dataset1)
            .attr("class", "line")
            .style("stroke", color1)
            .style("fill", "none")  
            .attr("d", lineLeft);

        // Draw the line for the second dataset
        svg.append("path")
            .datum(dataset2)
            .attr("class", "line")
            .style("stroke", color2)
            .style("fill", "none")
            .attr("d", lineRight);

        // Append X and Y axes
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${h - padding})`)
            .call(xAxis);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${padding},0)`)
            .call(yAxisLeft);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${w - padding},0)`)
            .call(yAxisRight);

        var nodalYears;
            if (disease === 'DTP') {
                nodalYears = [1996.1997,1998,1999,2000,2001,2002,2005,2009,2011,2013,2015,2018,2020,2021,2022];
            } else if (disease === 'Hepatitis') {
                nodalYears = [2001,2003,2005,2008,2011,2014,2015,2017,2018,2020,2021,2022];
            } else if (disease === 'Measles') {
                nodalYears = [1996, 1997, 1998, 2000, 2001,2002,2003,2005, 2009,2013,2016,2020,2022];
            }
    
            // Add circles for immunization dataset nodal points
            dataset1.forEach(function(d) {
                if (nodalYears.includes(d.date.getFullYear())) {
                    svg.append("circle")
                        .attr("cx", xScale(d.date))
                        .attr("cy", yScaleLeft(d.number))
                        .attr("r", 3)
                        .style("fill", color1);
                }
            });
    });



}


