
// Global variables to store data and visualization elements
var datasets = {};
var svg, xScale, yScaleLeft, yScaleRight, xAxis, yAxisLeft, yAxisRight,w,h,padding;

// Preload all datasets when the document is ready
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
     w = 800, h = 400, padding = 40;
 

    svg = d3.select("#chart").append("svg").attr("width", w).attr("height", h);


    
    xScale = d3.scaleTime().range([padding, w - padding]);
    yScaleLeft = d3.scaleLinear().range([h - padding, padding]);
    yScaleRight = d3.scaleLinear().range([h - padding, padding]);
    



    xAxis = svg.append("g").attr("transform", `translate(0,${h - padding})`);
    yAxisLeft = svg.append("g").attr("transform", `translate(${padding},0)`);
    yAxisRight = svg.append("g").attr("transform", `translate(${w - padding},0)`);

     // Append grid lines
     gridX = svg.append("g").attr("class", "grid");
   
 

    

    updateVisualization('DTP'); // Default visualization


}

function updateVisualization(disease) {
    var currentData = datasets[disease];

    // Update scales based on current data
    
    xScale.domain([d3.min(currentData.immunization.concat(currentData.incidence), d => d.date), d3.max(currentData.immunization.concat(currentData.incidence), d => d.date)]);
    
    var minValue = d3.min(currentData.immunization, d => d.number);

    yScaleLeft.domain([Math.max(0, minValue - 10), 100]);
    yScaleRight.domain([0, d3.max(currentData.incidence, d => d.number)]);

    // Transition for updating axes
    var t = svg.transition().duration(750);
    xAxis.transition(t).call(d3.axisBottom(xScale));
    yAxisLeft.transition(t).call(d3.axisLeft(yScaleLeft));
    yAxisRight.transition(t).call(d3.axisRight(yScaleRight));

    // Update or initialize line for immunization
    var lineLeft = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScaleLeft(d.number));

    var lineRight = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScaleRight(d.number));

    // Select or append path for immunization, then transition
    var pathLeft = svg.selectAll(".line.immunization")
        .data([currentData.immunization], d => d.date); // Key function for object constancy

    pathLeft.enter()
        .append("path")
        .attr("class", "line immunization")
        .style("stroke", "red")
        .style("fill", "none")
        .merge(pathLeft)
        .transition(t)
        .attr("d", lineLeft);

    // Remove old paths if any
    pathLeft.exit().remove();

    // Select or append path for incidence, then transition
    var pathRight = svg.selectAll(".line.incidence")
        .data([currentData.incidence], d => d.date); // Key function for object constancy

    pathRight.enter()
        .append("path")
        .attr("class", "line incidence")
        .style("stroke", "blue")
        .style("fill", "none")
        .merge(pathRight)
        .transition(t)
        .attr("d", lineRight);

    // Remove old paths if any
    pathRight.exit().remove();

    // Update grid lines

    // Update grid lines
    gridX.transition(t).call(d3.axisBottom(xScale).ticks(30)
        .tickSize(-h + 2 * padding)
        .tickFormat(""))
        .attr("transform", `translate(0,${h - padding})`);
        // Apply light color to grid lines
    gridX.selectAll("line")
        .style("stroke", "lightgray")
        .style("stroke-opacity", 0.8);
 
    updateTooltipsAndCircles(currentData,t);
}



function updateTooltipsAndCircles(currentData,t) {
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
                .attr("cx", xScale(d.date))
                .attr("cy", yScaleLeft(d.number))
                .attr("r", 0) // Start with a radius of 0 for the transition effect
                .style("fill", "red")
                .transition(t) // Apply the transition
                .attr("r", 5) // End with the desired radius
                .on("end", function() { // Tooltip behavior setup after transition ends
                    d3.select(this)
                        .on("mouseover", function(event) {
                            tooltip.transition()
                                .duration(300)
                                .style("opacity", .9)
                                .style("background-color", "lightsteelblue"); // Tooltip background color for dataset1
                            tooltip.html("<strong>Year:</strong> " + year + "<br/><strong>Event:</strong> " + currentData.immunizationEvents[year].events + "<br/><strong>Description:</strong> " + currentData.immunizationEvents[year].description)
                                .style("left", (event.pageX) + "px")
                                .style("top", (event.pageY - 28) + "px");
                        })
                        .on("mouseout", function(d) {
                            tooltip.transition()
                                .duration(300)
                                .style("opacity", 0);
                        });
                });
        }
    });

    // Add circles and tooltips for incidence dataset
    currentData.incidence.forEach(function(d) {
        var year = d.date.getFullYear();
        if (currentData.incidenceEvents[year]) {
            svg.append("circle")
                .attr("cx", xScale(d.date))
                .attr("cy", yScaleRight(d.number))
                .attr("r", 0) // Start with a radius of 0 for the transition effect
                .style("fill", "blue")
                .transition(t) // Apply the transition
                .attr("r", 5) // End with the desired radius
                .on("end", function() { // Tooltip behavior setup after transition ends
                    d3.select(this)
                        .on("mouseover", function(event) {
                            tooltip.transition()
                                .duration(300)
                                .style("opacity", .9)
                                .style("background-color", "lightcoral"); // Tooltip background color for dataset2
                            tooltip.html("<strong>Year:</strong> " + year + "<br/><strong>Event:</strong> " + currentData.incidenceEvents[year].Event + "<br/><strong>Description:</strong> " + currentData.incidenceEvents[year].Description)
                                .style("left", (event.pageX) + "px")
                                .style("top", (event.pageY - 28) + "px");
                        })
                        .on("mouseout", function(d) {
                            tooltip.transition()
                                .duration(300)
                                .style("opacity", 0);
                        });
                });
        }
    });
}

function rowConverter(d) {
    return {
        date: new Date(+d.YEA, 0),
        number: +d.Value
    };
};
