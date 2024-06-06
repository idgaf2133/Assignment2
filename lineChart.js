function showLineChart(disease) {
    var currentData = datasets[disease];

    //gridX = svg.append("g").attr("class", "grid");
    // Remove scatter plot circles
    svg.selectAll(".dot").transition().duration(750).attr("r", 0).remove();
    svg.selectAll(".trend-line").transition().attr("opacity", 0).remove();

    //append right axis



    // Update scales based on current data
    xScale.domain([d3.min(currentData.immunization.concat(currentData.incidence), d => d.date), d3.max(currentData.immunization.concat(currentData.incidence), d => d.date)]);
    var minValue = d3.min(currentData.immunization, d => d.number);
    yScaleLeft.domain([Math.max(0, minValue - 10), 100]);
    yScaleRight.domain([0, d3.max(currentData.incidence, d => d.number)]);



    // Transition for updating axes
    var t = svg.transition().duration(750);
    xAxis.transition(t).call(d3.axisBottom(xScale));
    yAxisLeft.transition(t).call(d3.axisLeft(yScaleLeft));



       // Remove and recreate the right y-axis for transition
    svg.selectAll(".y-axis-right").remove();
    yAxisRight = svg.append("g")
        .attr("class", "y-axis-right")
        .attr("transform", `translate(${w - padding},0)`)
        .call(d3.axisRight(yScaleRight))
        .transition(t);
    yAxisRight.transition(t).call(d3.axisRight(yScaleRight));

    // Update or initialize line for immunization
    var lineLeft = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScaleLeft(d.number));

    var lineRight = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScaleRight(d.number));

    var pathLeft = svg.selectAll(".line.immunization")
        .data([currentData.immunization], d => d.date);

    pathLeft.enter()
        .append("path")
        .attr("class", "line immunization")
        .style("stroke", "blue")
        .style("fill", "none")
        .merge(pathLeft)
        .transition(t)
        .attr("d", lineLeft);

    pathLeft.exit().transition(t).remove();

    var pathRight = svg.selectAll(".line.incidence")
        .data([currentData.incidence], d => d.date);

    pathRight.enter()
        .append("path")
        .attr("class", "line incidence")
        .style("stroke", "red")
        .style("fill", "none")
        .merge(pathRight)
        .transition(t)
        .attr("d", lineRight);

    pathRight.exit().transition(t).remove();

    svg.selectAll(".grid").remove(); // Remove existing grid

    gridX = svg.append("g") //append grid
        .attr("class", "grid")
        .attr("transform", `translate(0,${h - padding})`)
        .call(d3.axisBottom(xScale)
            .ticks(30)
            .tickSize(-h + 2 * padding)
            .tickFormat("")
        );

    gridX.transition(t).call(d3.axisBottom(xScale).ticks(30)
        .tickSize(-h + 2 * padding)
        .tickFormat(""))
        .attr("transform", `translate(0,${h - padding})`);

    gridX.selectAll("line")
        .style("stroke", "lightgray")
        .style("stroke-opacity", 0.2);
    

    


    addLineChartText();
    updateTooltipsAndCircles(currentData, t);
    addLegend();

     // Add heading with the corresponding disease
     svg.selectAll(".chart-title").remove(); // Remove previous heading

     svg.append("text")
         .attr("class", "chart-title")
         .attr("x", w / 2)
         .attr("y", (padding / 2) -4 )
         .attr("text-anchor", "middle")
         .style("font-size", "15px")
         .style("fill", "black")
         .style("opacity", 0)
         .text(disease +" Immunization and Incidence Rates Over Time ")
         .transition(t)
         .style("opacity", 1);
    
    // Update the text box with the paragraph
    var textContainer = document.getElementById("text-container");
    textContainer.innerHTML = ""; // Clear any existing content

    var paragraph = document.createElement("p");
    paragraph.style.opacity = 0; // Start with opacity 0 for transition
    paragraph.innerHTML = getParagraphContent(disease); // Get paragraph content based on disease

    textContainer.appendChild(paragraph);

    // Transition the text opacity to 1
    setTimeout(function() {
        paragraph.style.opacity = 1;
    }, 100);


    // Dynamically create the button to visualize scatter plot
    var buttonContainer = document.getElementById("button-container");
    buttonContainer.innerHTML = ""; // Clear any existing buttons

    var scatterPlotButton = document.createElement("button");
    scatterPlotButton.innerHTML = "Switch to Scatterplot";
    scatterPlotButton.className = "vis-button";
    scatterPlotButton.onclick = function() {
        showScatterPlot(disease);
    };

    buttonContainer.appendChild(scatterPlotButton);
}

function updateTooltipsAndCircles(currentData, t) {
    // Remove existing circles before setting up new ones
    svg.selectAll(".line-circle").remove();

    // Tooltip setup
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Add circles and tooltips for immunization dataset
    currentData.immunization.forEach(function(d) {
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
                            tooltip.transition()
                                .duration(300)
                                .style("opacity", .9)
                                .style("background-color", "lightsteelblue"); // Tooltip background color for dataset1
                            tooltip.html("<strong>Year:</strong> " + year + "<strong> Immunization:</strong> " + d.number+"%" + "<br/><strong>Event:</strong> " + currentData.immunizationEvents[year].Event + "<br/><strong>Description:</strong> " + currentData.immunizationEvents[year].Description)
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
                            tooltip.transition()
                                .duration(300)
                                .style("opacity", .9)
                                .style("background-color", "lightcoral"); // Tooltip background color for dataset2
                            tooltip.html("<strong>Year:</strong> " + year + "<strong>  Incidence:</strong> " + d.number + "<br/><strong>Event:</strong> " + currentData.incidenceEvents[year].Event + "<br/><strong>Description:</strong> " + currentData.incidenceEvents[year].Description)
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

