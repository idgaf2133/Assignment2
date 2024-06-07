function showLineChart(disease) {
    selectedDisease = disease; // Update the global variable

    var currentData = datasets[disease];

    // Show range sliders
    d3.select("#slider-wrapper").style("display", "block");

    // Remove existing elements
    svg.selectAll(".dot").transition().duration(750).attr("r", 0).remove();
    svg.selectAll(".trend-line").transition().attr("opacity", 0).remove();

    // Update scales based on current data
    var minDate = d3.min(currentData.immunization.concat(currentData.incidence), d => d.date);
    var maxDate = d3.max(currentData.immunization.concat(currentData.incidence), d => d.date);

    xScale.domain([minDate, maxDate]);
    var minValue = d3.min(currentData.immunization, d => d.number);
    yScaleLeft.domain([Math.max(0, minValue - 10), 100]);
    yScaleRight.domain([0, d3.max(currentData.incidence, d => d.number)]);

    // Transition for updating axes
    var t = svg.transition().duration(750);
    xAxis.transition(t).call(d3.axisBottom(xScale));
    yAxisLeft.transition(t).call(d3.axisLeft(yScaleLeft));

    svg.selectAll(".y-axis-right").remove();
    yAxisRight = svg.append("g")
        .attr("class", "y-axis-right")
        .attr("transform", `translate(${w - padding},0)`)
        .call(d3.axisRight(yScaleRight));

    yAxisRight.transition(t).call(d3.axisRight(yScaleRight));

    // Update lines with proper data binding
    var lineLeft = d3.line().x(d => xScale(d.date)).y(d => yScaleLeft(d.number));
    var lineRight = d3.line().x(d => xScale(d.date)).y(d => yScaleRight(d.number));

    var immunizationLine = svg.selectAll(".line.immunization")
        .data([currentData.immunization], d => d.date);

    immunizationLine.enter()
        .append("path")
        .attr("class", "line immunization")
        .merge(immunizationLine)
        .transition(t)
        .attr("d", lineLeft)
        .style("stroke", "blue")
        .style("fill", "none");

    immunizationLine.exit().remove();

    var incidenceLine = svg.selectAll(".line.incidence")
        .data([currentData.incidence], d => d.date);

    incidenceLine.enter()
        .append("path")
        .attr("class", "line incidence")
        .merge(incidenceLine)
        .transition(t)
        .attr("d", lineRight)
        .style("stroke", "red")
        .style("fill", "none");

    incidenceLine.exit().remove();

    // Append grid
    svg.selectAll(".grid").remove();
    gridX = svg.append("g").attr("class", "grid").attr("transform", `translate(0,${h - padding})`).call(d3.axisBottom(xScale).ticks(d3.timeYear.every(1)).tickSize(-h + 2 * padding).tickFormat(""));
    gridX.transition(t).call(d3.axisBottom(xScale).ticks(d3.timeYear.every(1)).tickSize(-h + 2 * padding).tickFormat("")).attr("transform", `translate(0,${h - padding})`);
    gridX.selectAll("line").style("stroke", "lightgray").style("stroke-opacity", 0.2);

    addLineChartText();
    updateTooltipsAndCircles(currentData, t, maxDate);
    addLegend();

    svg.selectAll(".chart-title").remove();
    svg.append("text").attr("class", "chart-title").attr("x", w / 2).attr("y", (padding / 2) - 6).attr("text-anchor", "middle").style("font-size", "15px").style("fill", "black").style("opacity", 0).text(disease + " Immunization and Incidence Rates Over Time ").transition(t).style("opacity", 1);

    var textContainer = document.getElementById("text-container");
    textContainer.innerHTML = "";
    var paragraph = document.createElement("p");
    paragraph.style.opacity = 0;
    paragraph.innerHTML = getParagraphContent(disease);
    textContainer.appendChild(paragraph);
    setTimeout(function() {
        paragraph.style.opacity = 1;
    }, 100);

    var buttonContainer = document.getElementById("button-container");
    buttonContainer.innerHTML = "";
    var scatterPlotButton = document.createElement("button");
    scatterPlotButton.innerHTML = "Switch to Scatterplot";
    scatterPlotButton.className = "vis-button";
    scatterPlotButton.onclick = function() {
        showScatterPlot(disease);
    };
    buttonContainer.appendChild(scatterPlotButton);

    // Store min and max dates in the range sliders for later use
    var minTime = minDate.getTime();
    var maxTime = maxDate.getTime();
    d3.select("#start-slider").attr("min", minTime).attr("max", maxTime).attr("value", minTime);
    d3.select("#end-slider").attr("min", minTime).attr("max", maxTime).attr("value", maxTime);

    // Update the display for date range
    d3.select("#start-date").text(minDate.getFullYear());
    d3.select("#end-date").text(maxDate.getFullYear());

    // Initial update of the time range
    updateTimeRange();
}

function updateTimeRange() {
    var startTime = +d3.select("#start-slider").property("value");
    var endTime = +d3.select("#end-slider").property("value");

    // Ensure start time is not after end time
    if (startTime > endTime) {
        // Swap values
        var temp = startTime;
        startTime = endTime;
        endTime = temp;
    }

    var startDate = new Date(startTime);
    var endDate = new Date(endTime);

    // Update the display for date range
    d3.select("#start-date").text(startDate.getFullYear());
    d3.select("#end-date").text(endDate.getFullYear());

    // Get current data for the selected disease
    var currentData = datasets[selectedDisease];

    // Update xScale domain
    xScale.domain([startDate, endDate]);

    // Transition for updating axes
    var t = svg.transition().duration(750);
    xAxis.transition(t).call(d3.axisBottom(xScale));

    // Update lines with proper data binding and transitioning
    var lineLeft = d3.line().x(d => xScale(d.date)).y(d => yScaleLeft(d.number));
    var lineRight = d3.line().x(d => xScale(d.date)).y(d => yScaleRight(d.number));

    var immunizationLine = svg.selectAll(".line.immunization")
        .data([currentData.immunization.filter(d => d.date >= startDate && d.date <= endDate)], d => d.date);

    immunizationLine.enter()
        .append("path")
        .attr("class", "line immunization")
        .merge(immunizationLine)
        .transition(t)
        .attr("d", lineLeft)
        .style("stroke", "blue")
        .style("fill", "none");

    immunizationLine.exit().remove();

    var incidenceLine = svg.selectAll(".line.incidence")
        .data([currentData.incidence.filter(d => d.date >= startDate && d.date <= endDate)], d => d.date);

    incidenceLine.enter()
        .append("path")
        .attr("class", "line incidence")
        .merge(incidenceLine)
        .transition(t)
        .attr("d", lineRight)
        .style("stroke", "red")
        .style("fill", "none");

    incidenceLine.exit().remove();

    // Update circles and tooltips
    updateTooltipsAndCircles(currentData, t, startDate, endDate);

    // Update grid with transitioning
    svg.selectAll(".grid").remove();
    gridX = svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${h - padding})`)
        .call(d3.axisBottom(xScale).ticks(d3.timeYear.every(1)).tickSize(-h + 2 * padding).tickFormat(""));
    
    gridX.transition(t)
        .call(d3.axisBottom(xScale).ticks(d3.timeYear.every(1)).tickSize(-h + 2 * padding).tickFormat(""))
        .attr("transform", `translate(0,${h - padding})`);
    
    gridX.selectAll("line").style("stroke", "lightgray").style("opacity", 0.2);
}


function updateTooltipsAndCircles(currentData, t, startDate, endDate) {
    // Remove existing circles before setting up new ones
    svg.selectAll(".line-circle").remove();

    // Tooltip setup
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Filter data based on the selected date range
    var filteredImmunizationData = currentData.immunization.filter(d => d.date >= startDate && d.date <= endDate);
    var filteredIncidenceData = currentData.incidence.filter(d => d.date >= startDate && d.date <= endDate);

    // Add circles and tooltips for immunization dataset
    filteredImmunizationData.forEach(function(d) {
        var year = d.date.getFullYear();
        if (currentData.immunizationEvents[year]) {
            svg.append("circle")
                .attr("class", "line-circle")
                .attr("cx", xScale(d.date))
                .attr("cy", yScaleLeft(d.number))
                .attr("r", 0) // Start with a radius of 0 for the transition effect
                .style("fill", "blue")
                .transition(t) // Apply the transition
                .attr("r", 5) // End with the desired radius
                .on("end", function() { // Tooltip behavior setup after transition ends
                    d3.select(this)
                        .on("mouseover", function(event) {
                            d3.select(this)
                                .transition()
                                .duration(300)
                                .attr("r", 10); // Increase radius on hover
                            tooltip.transition()
                                .duration(300)
                                .style("opacity", .9)
                                .style("background-color", "lightsteelblue"); // Tooltip background color for dataset1
                            tooltip.html("<strong>Year:</strong> " + year + "<strong> Immunization:</strong> " + d.number + "%" + "<br/><strong>Event:</strong> " + currentData.immunizationEvents[year].Event + "<br/><strong>Description:</strong> " + currentData.immunizationEvents[year].Description)
                                .style("left", (event.pageX) + "px")
                                .style("top", (event.pageY - 28) + "px");
                        })
                        .on("mouseout", function(event, d) {
                            d3.select(this)
                                .transition()
                                .duration(300)
                                .attr("r", 5); // Restore radius on mouseout
                            tooltip.transition()
                                .duration(300)
                                .style("opacity", 0);
                        });
                });
        }
    });

    // Add circles and tooltips for incidence dataset
    filteredIncidenceData.forEach(function(d) {
        var year = d.date.getFullYear();
        if (currentData.incidenceEvents[year]) {
            svg.append("circle")
                .attr("class", "line-circle")
                .attr("cx", xScale(d.date))
                .attr("cy", yScaleRight(d.number))
                .attr("r", 0) // Start with a radius of 0 for the transition effect
                .style("fill", "red")
                .transition(t) // Apply the transition
                .attr("r", 5) // End with the desired radius
                .on("end", function() { // Tooltip behavior setup after transition ends
                    d3.select(this)
                        .on("mouseover", function(event) {
                            d3.select(this)
                                .transition()
                                .duration(300)
                                .attr("r", 10); // Increase radius on hover
                            tooltip.transition()
                                .duration(300)
                                .style("opacity", .9)
                                .style("background-color", "lightcoral"); // Tooltip background color for dataset2
                            tooltip.html("<strong>Year:</strong> " + year + "<strong>  Incidence:</strong> " + d.number + "<br/><strong>Event:</strong> " + currentData.incidenceEvents[year].Event + "<br/><strong>Description:</strong> " + currentData.incidenceEvents[year].Description)
                                .style("left", (event.pageX) + "px")
                                .style("top", (event.pageY - 28) + "px");
                        })
                        .on("mouseout", function(event, d) {
                            d3.select(this)
                                .transition()
                                .duration(300)
                                .attr("r", 5); // Restore radius on mouseout
                            tooltip.transition()
                                .duration(300)
                                .style("opacity", 0);
                        });
                });
        }
    });
}

function addLegend() {
    // Remove any existing legend
    svg.selectAll(".legend").remove();

    // Create a legend group
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${w - 680}, 20)`); // Position the legend at the top-right corner

    // Define legend data
    var legendData = [
        { label: "Immunization", color: "blue" },
        { label: "Incidence", color: "red" }
    ];

    // Create legend items
    var legendItem = legend.selectAll(".legend-item")
        .data(legendData)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(${i * 90}, 0)`); // Space items horizontally

     // Append colored rectangles
    legendItem.append("rect")
        .attr("x", 0)
        .attr("y", 2)
        .attr("width", 10)  // Reduced size
        .attr("height", 10) // Reduced size
        .style("fill", d => d.color);

    // Append text labels
    legendItem.append("text")
        .attr("x", 15)      // Adjust spacing between rectangle and text
        .attr("y", 9)
        .attr("dy", "0.2em")
        .style("font-size", "12px")  // Reduced font size
        .text(d => d.label);

}

function addLineChartText(){
    // Remove old axis labels before adding new ones with fade-in transition
    svg.selectAll(".x.label, .y.label").remove();

    // Append x-axis label with fade-in transition
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", w / 2)
        .attr("y", h - padding / 12)
        .style("opacity", 0) // Initial opacity
        .text("Year")
        .style("font-size", "12px")  // Reduced font size
        .transition() // Transition to fade in
        .duration(2000)
        .style("opacity", 1); // Final opacity

    // Append y-axis label for left axis with fade-in transition
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -h / 2)
        .attr("y", padding-15 )
        .attr("dy", "-1em")
        .attr("transform", "rotate(-90)")
        .style("opacity", 0) // Initial opacity
        .text("Incidence Rate (per 100,000)")
        .style("font-size", "12px")  // Reduced font size
        .transition() // Transition to fade in
        .duration(2000)
        .style("opacity", 1); // Final opacity

    // Append y-axis label for right axis with fade-in transition
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -h / 2)
        .attr("y", w - padding /60)
        .attr("dy", "-0.2em")
        .attr("transform", "rotate(-90)")
        .style("opacity", 0) // Initial opacity
        .text("Immunization Rate (%)")
        .style("font-size", "12px")  // Reduced font size
        .transition() // Transition to fade in
        .duration(2000)
        .style("opacity", 1); // Final opacit
}

function getParagraphContent(disease) {
    var paragraphs = {
        'DTP': 'The analysis of the immunization and incidence rates over time shows that periods of lower immunization rates often coincide with peaks in incidence rates. Public health interventions appear to increase immunization rates and reduce incidence rates. The scatter plot analysis indicates a positive correlation between immunization rates and incidence rates, suggesting that as immunization rates increased, incidence rates also increased. These findings highlight significant trends and patterns in the relationship between immunization coverage and disease incidence.',
        'Measles': 'The dual-axis line chart and scatter plot reveal key trends and patterns in measles immunization and incidence rates. The line chart shows a clear inverse relationship: as immunization rates rise, incidence rates fall. This trend is reinforced by public health campaigns and policy changes, which significantly boost immunization rates and reduce incidence. However, periodic spikes in incidence suggest ongoing challenges, such as outbreaks in unvaccinated populations. The scatter plot supports these findings, displaying a strong negative correlation between immunization and incidence rates, with higher immunization rates generally associated with lower incidence rates. These patterns highlight the effectiveness of vaccination in controlling measles.',
        'Hepatitis': 'The analysis of the immunization and incidence rates over time shows that periods of high immunization rates generally coincide with a decline in incidence rates, despite occasional spikes during specific outbreak events. Public health interventions and vaccination programs have maintained high immunization rates, contributing to an overall reduction in incidence rates. The scatter plot analysis, however, indicates a slight positive correlation between immunization rates and incidence rates, suggesting that as immunization rates increased, incidence rates also showed slight increases.'
    };
    return paragraphs[disease];
}

