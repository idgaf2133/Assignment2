
function showScatterPlot(disease) {
    var currentData = datasets[disease];
      // Show range sliders
      d3.select("#slider-wrapper").style("display", "none");

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
            .tickSize(-h +  2*padding)
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
        .style("fill", "Purple")
        .on("click", function(event, d) {
            d3.select(this)
                .transition()
                .duration(750)
                .attr("r", 20)
                .transition()
                .duration(750)
                .attr("r", 5);
        })
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
         .text(disease + " Immunization vs Incidence rates with trend line")
         .transition(t)
         .style("opacity", 1);
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
}






function linearRegression(x, y) {
    var n = x.length;
    var sumX = d3.sum(x);
    var sumY = d3.sum(y);
    var sumXY = d3.sum(x.map((d, i) => d * y[i]));
    var sumXX = d3.sum(x.map(d => d * d));

    var slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    var intercept = (sumY - slope * sumX) / n;

    return { slope: slope, intercept: intercept };
}
function addScatterPlotText() {
    // Remove old axis labels before adding new ones with fade-in transition
    svg.selectAll(".x.label, .y.label").remove();

    // Append x-axis label with fade-in transition
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", w / 2)
        .attr("y", h - padding / 12)
        .style("opacity", 0) // Initial opacity
        .text("Immunization Rate (%)")
        .style("font-size", "12px")  // Reduced font size
        .transition() // Transition to fade in
        .duration(2000)
        .style("opacity", 1); // Final opacity

    // Append y-axis label for left axis with fade-in transition
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -h / 2)
        .attr("y", padding-16)
        .attr("dy", "-1em")
        .attr("transform", "rotate(-90)")
        .style("opacity", 0) // Initial opacity
        .text("Incidence Rate (per 100,000)")
        .style("font-size", "12px")  // Reduced font size
        .transition() // Transition to fade in
        .duration(2000)
        .style("opacity", 1); // Final opacity
}
