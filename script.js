

function init() {
  
    loadVisualization('Files/Diptheria/Diptheria.csv', 'Files/Diptheria/Diptheria_incidence.csv', 'blue', 'red', 'DTP'); // Load default visualization on start
}

window.onload = init;


function loadVisualization(file1, file2, color1, color2, disease) {
    var w = 500;
    var h = 250;
    var padding = 30;
    
    // Importing events data for tooltips
    var eventsData;
    if (disease === 'DTP') {
        eventsData = 'Files/Diptheria/DTPImmunizationEvents.json';
    } else if (disease === 'Hepatitis') {
        eventsData = 'Files/Hepatitis/HepatitisImmunizationEvents.json';
    } else if (disease === 'Measles') {
        eventsData = 'Files/Measels/MeaselsImmunizationEvents.json';
    }

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

    // Tooltip setup
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    Promise.all([
        d3.csv(file1, rowConverter),
        d3.csv(file2, rowConverter),
        d3.json(eventsData)
    ]).then(function(data) {
        var dataset1 = data[0];
        var dataset2 = data[1];
        var events = data[2];

        var xScale = d3.scaleTime()
            .domain([d3.min(dataset1.concat(dataset2), d => d.date), d3.max(dataset1.concat(dataset2), d => d.date)])
            .range([padding, w - padding]);

        var minValue = d3.min(dataset1, d => d.number);
        var yScaleLeft = d3.scaleLinear() 
            .domain([Math.max(0, minValue - 10), 100]) 
            .range([h - padding, padding]);


        var yScaleRight = d3.scaleLinear()
            .domain([0, d3.max(dataset2, d => d.number)])
            .range([h - padding, padding]);

        var xAxis = d3.axisBottom().scale(xScale).ticks(10);
        var yAxisLeft = d3.axisLeft().scale(yScaleLeft).ticks(6);
        var yAxisRight = d3.axisRight().scale(yScaleRight).ticks(4);

        // Lines for left and right datasets
        var lineLeft = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScaleLeft(d.number));

        var lineRight = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScaleRight(d.number));

        // Draw the lines
        svg.append("path").datum(dataset1).attr("class", "line").style("stroke", color1).style("fill", "none")  .attr("d", lineLeft);
        svg.append("path").datum(dataset2).attr("class", "line").style("stroke", color2).style("fill", "none")  .attr("d", lineRight);

        // Add axes
        svg.append("g").attr("transform", `translate(0,${h - padding})`).call(xAxis);
        svg.append("g").attr("transform", `translate(${padding},0)`).call(yAxisLeft);
        svg.append("g").attr("transform", `translate(${w - padding},0)`).call(yAxisRight);

        // Add circles and tooltips
        dataset1.forEach(function(d) {
            var year = d.date.getFullYear();
            if (events[year]) {
                svg.append("circle")
                    .attr("cx", xScale(d.date))
                    .attr("cy", yScaleLeft(d.number))
                    .attr("r", 5)
                    .style("fill", color1)
                    .on("mouseover", function(event) {
                        tooltip.transition()
                            .duration(300)
                            .style("opacity", .9);
                        tooltip.html("<strong>Year:</strong> " + year + "<br/><strong>Event:</strong> " + events[year].events + "<br/><strong>Description:</strong> " + events[year].description)
                            .style("left", (event.pageX) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(d) {
                        tooltip.transition()
                            .duration(300)
                            .style("opacity", 0);
                    });
            }
        });
    });
}
