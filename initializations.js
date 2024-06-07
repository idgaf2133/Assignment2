// Global variables to store data and visualization elements
var datasets = {};
var svg, xScale, yScaleLeft, yScaleRight, xAxis, yAxisLeft, yAxisRight, w, h, padding, currentData;
var selectedDisease = 'DTP'; // Default disease

// Preload all datasets when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load datasets using d3.csv and d3.json
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
        // Store datasets in global object
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
        
        // Initialize visualization with the first available dataset
        initVisualization();
    });
});

// Function to initialize the visualization
function initVisualization() {
    w = 700, h = 350, padding = 40;
    
    // Create SVG element
    svg = d3.select("#chart").append("svg").attr("width", w).attr("height", h);

    // Set up scales for x and y axes
    xScale = d3.scaleTime().range([padding, w - padding]);
    yScaleLeft = d3.scaleLinear().range([h - padding, padding]);
    yScaleRight = d3.scaleLinear().range([h - padding, padding]);
    
    // Append x and y axes to SVG
    xAxis = svg.append("g").attr("transform", `translate(0,${h - padding})`);
    yAxisLeft = svg.append("g").attr("transform", `translate(${padding},0)`);
    
    // Default visualization
    showLineChart(selectedDisease);
}

// Function to convert row data to appropriate format
function rowConverter(d) {
    return {
        date: new Date(+d.YEA, 0),
        number: +d.Value
    };
};
