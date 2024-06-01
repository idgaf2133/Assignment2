// Global variables to store data and visualization elements
var datasets = {};
var svg, xScale, yScaleLeft, yScaleRight, xAxis, yAxisLeft, yAxisRight, gridX, w, h, padding;
var lineContainer, backgroundRect, bisect;

document.addEventListener('DOMContentLoaded', function() {
    Promise.all([
        d3.csv('Files/Diptheria/Diptheria.csv', rowConverter),
        d3.csv('Files/Diptheria/Diptheria_incidence.csv', rowConverter),
        d3.json('Files/Diptheria/DTPImmunizationEvents.json'),
        d3.json('Files/Diptheria/DTPIncidenceEvents.json'),
        d3.csv('Files/Measels/Measels.csv', rowConverter),
        d3.csv('Files/Measels/Measels_incidence.csv', rowConverter),
        d3.json('Files/Measels/MeaselsImmunizationEvents.json'),
        d3.json('Files/Measels/MeaselsIncidenceEvents.json'),
        d3.csv('Files/Hepatitis/Hepatitis.csv', rowConverter),
        d3.csv('Files/Hepatitis/Hepatitis_incidence.csv', rowConverter),
        d3.json('Files/Hepatitis/HepatitisImmunizationEvents.json'),
        d3.json('Files/Hepatitis/HepatitisIncidenceEvents.json')
    ]).then(function(data) {
        datasets['DTP'] = {
            immunization: data[0],
            incidence: data[1],
            immunizationEvents: data[2],
            incidenceEvents: data[3]
        };
        datasets['Measles'] = {
            immunization: data[4],
            incidence: data[5],
            immunizationEvents: data[6],
            incidenceEvents: data[7]
        };
        datasets['Hepatitis'] = {
            immunization: data[8],
            incidence: data[9],
            immunizationEvents: data[10],
            incidenceEvents: data[11]
        };
        
        initVisualization(); // Initialize visualization with the first available dataset
    });
});

function initVisualization() {
    w = 800, h = 400, padding = 50;

    svg = d3.select("#chart").append("svg")
        .attr("width", w)
        .attr("height", h)
        .style("background-color", "white");

    // Background rect with initial settings
    backgroundRect = svg.append("rect")
        .attr("x", padding)
        .attr("y", padding)
        .attr("width", w - 2 * padding)
        .attr("height", h - 2 * padding)
        .attr("fill", "white");

    xScale = d3.scaleTime().range([padding, w - padding]);
    yScaleLeft = d3.scaleLinear().range([h - padding, padding]);
    yScaleRight = d3.scaleLinear().range([h - padding, padding]);

    xAxis = svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0,${h - padding})`);

    yAxisLeft = svg.append("g")
        .attr("class", "axis axis--y axis--y-left")
        .attr("transform", `translate(${padding},0)`);

    yAxisRight = svg.append("g")
        .attr("class", "axis axis--y axis--y-right")
        .attr("transform", `translate(${w - padding},0)`);

    // Append grid lines
    gridX = svg.append("g").attr("class", "grid");

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", w - 2 * padding)
        .attr("height", h - 2 * padding)
        .attr("x", padding)
        .attr("y", padding);

    // Create the line container: where the lines will be drawn
    lineContainer = svg.append('g')
      .attr("clip-path", "url(#clip)");

    // Tooltip setup
    tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    bisect = d3.bisector(d => d.date).left;

    updateVisualization('DTP'); // Default visualization
}

function updateVisualization(disease) {
    var currentData = datasets[disease];

    // Update scales based on current data
    xScale.domain([d3.min(currentData.immunization.concat(currentData.incidence), d => d.date), d3.max(currentData.immunization.concat(currentData.incidence), d => d.date)]);

    yScaleLeft.domain([Math.max(0, d3.min(currentData.immunization, d => d.number) - 10), d3.max(currentData.immunization, d => d.number) + 10]);
    yScaleRight.domain([0, d3.max(currentData.incidence, d => d.number)]);

    // Transition for updating axes and background color
    var t = svg.transition().duration(750);
    xAxis.transition(t).call(d3.axisBottom(xScale));
    yAxisLeft.transition(t).call(d3.axisLeft(yScaleLeft));
    yAxisRight.transition(t).call(d3.axisRight(yScaleRight));

    // Apply the background color transition each time the chart is updated
    backgroundRect
        .attr("fill", "white")
        .transition(t)
        .attr("fill", "beige");

    // Update or initialize line for immunization
    var lineLeft = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScaleLeft(d.number));

    var lineRight = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScaleRight(d.number));

    // Set line colors based on disease
    
    var colorImmunization, colorIncidence, tooltipColor;
    if (disease === 'DTP') {
        colorImmunization = "#56B4E9"; // Sky Blue
        colorIncidence = "#E69F00"; // Orange
        tooltipColor = "lightsteelblue";
    } else if (disease === 'Hepatitis') {
        colorImmunization = "#F0E442"; // Yellow
        colorIncidence = "#009E73"; // Bluish Green
        tooltipColor = "lightgreen";
    } else if (disease === 'Measles') {
        colorImmunization = "#CC79A7"; // Reddish Purple
        colorIncidence = "#D55E00"; // Vermillion
        tooltipColor = "lightcoral";
    }

    // Select or append path for immunization, then transition
    var pathLeft = lineContainer.selectAll(".line.immunization")
        .data([currentData.immunization], d => d.date); // Key function for object constancy

    pathLeft.enter()
        .append("path")
        .attr("class", "line immunization")
        .style("stroke", colorImmunization)
        .style("fill", "none")
        .merge(pathLeft)
        .transition(t)
        .attr("d", lineLeft);

    // Remove old paths if any
    pathLeft.exit().remove();

    // Select or append path for incidence, then transition
    var pathRight = lineContainer.selectAll(".line.incidence")
        .data([currentData.incidence], d => d.date); // Key function for object constancy

    pathRight.enter()
        .append("path")
        .attr("class", "line incidence")
        .style("stroke", colorIncidence)
        .style("fill", "none")
        .merge(pathRight)
        .transition(t)
        .attr("d", lineRight);

    // Remove old paths if any
    pathRight.exit().remove();

    // Update grid lines
    var gridXTicks = d3.axisBottom(xScale).ticks(30)
        .tickSize(-h + 2 * padding)
        .tickFormat("");

    gridX.call(gridXTicks)
        .attr("transform", `translate(0,${h - padding})`);

    // Apply dark color to grid lines
    gridX.selectAll("line")
        .style("stroke", "gray")
        .style("stroke-opacity", 0.8)
        .style("stroke-dasharray", "2,2");

    // Wipe transition for grid lines
    gridX.selectAll("line")
        .attr("y2", 0)
        .transition(t)
        .attr("y2", -h + 2 * padding);

    // Remove old axis labels before adding new ones with fade-in transition
    svg.selectAll(".x.label, .y.label").remove();



    updateTooltipsAndCircles(currentData, t, colorImmunization, colorIncidence, tooltipColor);
}

function updateTooltipsAndCircles(currentData, t, colorImmunization, colorIncidence, tooltipColor) {
    // Remove existing circles before setting up new ones
    svg.selectAll("circle").remove();

    // Tooltip setup
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Add circles and tooltips for immunization dataset
    currentData.immunization.forEach(function(d) {
        var year = d.date.getFullYear();
        if (currentData.immunizationEvents[year]) {
            svg.append("circle")
                .attr("class", "immunization")
                .attr("cx", xScale(d.date))
                .attr("cy", yScaleLeft(d.number))
                .attr("r", 5)
                .style("fill", colorImmunization) // Color based on disease
                .on("mouseover", function(event) {
                    tooltip.transition()
                        .duration(300)
                        .style("opacity", .9)
                        .style("background-color", tooltipColor); // Tooltip background color
                    tooltip.html("<strong>Year:</strong> " + year + "<br/><strong>Event:</strong> " + currentData.immunizationEvents[year].events + "<br/><strong>Description:</strong> " + currentData.immunizationEvents[year].description)
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

    // Add circles and tooltips for incidence dataset
    currentData.incidence.forEach(function(d) {
        var year = d.date.getFullYear();
        if (currentData.incidenceEvents[year]) {
            svg.append("circle")
                .attr("class", "incidence")
                .attr("cx", xScale(d.date))
                .attr("cy", yScaleRight(d.number))
                .attr("r", 5)
                .style("fill", colorIncidence) // Color based on disease
                .on("mouseover", function(event) {
                    tooltip.transition()
                        .duration(300)
                        .style("opacity", .9)
                        .style("background-color", tooltipColor); // Tooltip background color
                    tooltip.html("<strong>Year:</strong> " + year + "<br/><strong>Event:</strong> " + currentData.incidenceEvents[year].Event + "<br/><strong>Description:</strong> " + currentData.incidenceEvents[year].Description)
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
}

function rowConverter(d) {
    return {
        date: new Date(+d.YEA, 0),
        number: +d.Value
    };
}