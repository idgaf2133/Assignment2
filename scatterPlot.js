function showScatterPlot(disease) {
    var currentData = datasets[disease];

    // Hide line chart elements including lines, y-axis labels, and grid lines
    svg.selectAll(".line-circle").transition().duration(750).attr("r", 0).remove();
    svg.selectAll(".line,.grid,.y-axis-right,.legend").transition().duration(750).attr("opacity", 0).remove();

    // Update scales for scatter plot
    var minValue = d3.min(currentData.immunization, d => d.number);
    xScale.domain([minValue - 2, 100]); // Immunization rates on x-axis (minimum value to 100%)
    yScaleLeft.domain([0, d3.max(currentData.incidence, d => d.number)]); // Incidence rates on y-axis

    // Transition for updating axes
    var t = svg.transition().duration(750);
    xAxis.transition(t).call(d3.axisBottom(xScale));
    yAxisLeft.transition(t).call(d3.axisLeft(yScaleLeft));

    // Remove any existing grid lines
    svg.selectAll(".grid").remove();

    // Add grid lines for scatter plot
    var gridX = svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${h - padding})`)
        .call(d3.axisBottom(xScale)
            .ticks(10)
            .tickSize(-h + 2 * padding)
            .tickFormat("")
        );

    var gridY = svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(${padding},0)`)
        .call(d3.axisLeft(yScaleLeft)
            .ticks(10)
            .tickSize(-w + 2 * padding)
            .tickFormat("")
        );

    gridX.selectAll("line")
        .style("stroke", "lightgray")
        .style("stroke-opacity", 0.4);

    gridY.selectAll("line")
        .style("stroke", "lightgray")
        .style("stroke-opacity", 0.4);

    // Remove the axis path to diminish the border lines entirely
    svg.selectAll(".grid path")
        .style("stroke", "none")
        .style("opacity", 0);

    // Append circles for scatter plot with transitions
    var circles = svg.selectAll(".dot")
        .data(currentData.immunization.map((d, i) => ({ 
            immunization: d.number, 
            incidence: currentData.incidence[i].number, 
            date: d.date 
        })));

    circles.enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.immunization))
        .attr("cy", d => yScaleLeft(d.incidence))
        .attr("r", 0)
        .style("fill", "purple")
        .transition(t)
        .attr("r", 5);

    circles.exit().transition(t).attr("r", 0).remove();

    // Tooltip setup
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.selectAll(".dot")
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(300).style("opacity", .9);
            tooltip.html("<strong>Date:</strong> " + d.date.getFullYear() + "<br/><strong>Immunization:</strong> " + d.immunization + "%<br/><strong>Incidence:</strong> " + d.incidence)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition().duration(300).style("opacity", 0);
        });

    addScatterPlotText();

    // Prepare the data for regression
    var xData = currentData.immunization.map(d => d.number);
    var yData = currentData.incidence.map(d => d.number);

    // Calculate the linear regression
    var regression = linearRegression(xData, yData);

    // Generate points for the trend line
    var trendLine = [
        { x: d3.min(xData), y: regression.slope * d3.min(xData) + regression.intercept },
        { x: d3.max(xData), y: regression.slope * d3.max(xData) + regression.intercept }
    ];

    // Add the trend line to the scatter plot with a fade-in transition
    var trend = svg.selectAll(".trend-line")
        .data([trendLine]);

    trend.enter().append("line")
        .attr("class", "trend-line")
        .attr("x1", xScale(trendLine[0].x))
        .attr("y1", yScaleLeft(trendLine[0].y))
        .attr("x2", xScale(trendLine[1].x))
        .attr("y2", yScaleLeft(trendLine[1].y))
        .style("stroke", "green")
        .style("stroke-width", 2)
        .style("opacity", 0)
        .transition()
        .duration(750)
        .style("opacity", 1);

    // Add fade-out transition for the exit selection
    trend.exit()
        .transition()
        .style("opacity", 0)
        .remove();

    // Add button to switch back to line chart
    var buttonContainer = document.getElementById("button-container");
    buttonContainer.innerHTML = ""; // Clear any existing buttons

    var lineChartButton = document.createElement("button");
    lineChartButton.innerHTML = "Switch to Line Chart";
    lineChartButton.className = "vis-button";
    lineChartButton.onclick = function() {
        showLineChart(disease);
    };

    buttonContainer.appendChild(lineChartButton);

    // Add zoom and pan functionality
    var zoom = d3.zoom()
        .scaleExtent([1, 20])  // Adjust this to control zoom limits
        .extent([[1, 5], [w, h]])
        .on("zoom", zoomed);

    // Add an invisible rect on top of the chart area to capture zoom events
    svg.append("rect")
        .attr("width", w)
        .attr("height", h)
        .style("fill", "none")
        .style("pointer-events", "all")
        .call(zoom);

    function zoomed(event) {
        // Rescale axes
        var new_xScale = event.transform.rescaleX(xScale);
        var new_yScaleLeft = event.transform.rescaleY(yScaleLeft);

        // Update axes
        xAxis.call(d3.axisBottom(new_xScale));
        yAxisLeft.call(d3.axisLeft(new_yScaleLeft));

        // Update circle positions
        svg.selectAll(".dot")
            .attr("cx", d => new_xScale(d.immunization))
            .attr("cy", d => new_yScaleLeft(d.incidence));

        // Update trend line positions
        svg.selectAll(".trend-line")
            .attr("x1", new_xScale(trendLine[0].x))
            .attr("y1", new_yScaleLeft(trendLine[0].y))
            .attr("x2", new_xScale(trendLine[1].x))
            .attr("y2", new_yScaleLeft(trendLine[1].y));
    }

    // Double-click event to zoom in
    svg.on("dblclick.zoom", function(event) {
        var [x, y] = d3.pointer(event);
        var zoomLevel = 5; // Adjust this value to control zoom level
        var newTransform = d3.zoomIdentity
            .translate(w / 2 - zoomLevel * x, h / 2 - zoomLevel * y)
            .scale(zoomLevel);

        svg.transition().duration(750).call(zoom.transform, newTransform);
    });

    // Single-click event to reset zoom
    svg.on("click", function() {
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    });
}
