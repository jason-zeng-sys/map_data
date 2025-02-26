Promise.all([
    d3.json("Data/ChoroplethMap.json"),          // Load GeoJSON map data (e.g., counties)
    d3.csv("Data/national_health_data_2024.csv")  // Load CSV data
  ]).then(([geoData, csvData]) => {
    // --- STEP 1: Parse and Convert CSV Data ---
    csvData.forEach(d => {
     
      d.cnty_fips = d.cnty_fips.padStart(5, '0');
      

      d.poverty = +d.poverty_perc;
      // (Convert additional columns as needed)
    });
    
    // --- STEP 2: Create a Lookup Object by FIPS ---
    const dataByFips = {};
    csvData.forEach(d => {
      dataByFips[d.cnty_fips] = d;
    });
    
    // --- STEP 3: Join CSV Data to GeoJSON Features ---
    // Assume the GeoJSON file has a property "GEOID" for county FIPS.
    geoData.features.forEach(feature => {
      // Get the county FIPS from the GeoJSON feature properties.
      const fips = feature.properties.GEOID; // or feature.properties.fips if named differently
      // Look up the corresponding CSV row using our lookup object.
      const csvRow = dataByFips[fips];
      if (csvRow) {
        // Attach CSV data to the GeoJSON feature properties.
        feature.properties.poverty = csvRow.poverty;
      
      } else {
       
        feature.properties.poverty = null;
      }
    });
    
    // --- STEP 4: Draw the Choropleth Map ---
    const width = 800, height = 500;
    const svg = d3.select("body").append("svg")
                  .attr("width", width)
                  .attr("height", height);
    
    // Define a projection (using Albers USA for U.S. maps) and path generator.
    const projection = d3.geoAlbersUsa()
                         .scale(1000)            // adjust scale as needed
                         .translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);
    
    // Create a color scale based on the poverty measure.
    // Use d3.extent to compute the min and max values.
    const povertyExtent = d3.extent(csvData, d => d.poverty);
    const colorScale = d3.scaleQuantize()
                         .domain(povertyExtent)
                         .range(d3.schemeBlues[9]); // You can choose another color scheme
    
    // Draw each county as a path.
    svg.selectAll("path")
       .data(geoData.features)
       .enter().append("path")
         .attr("d", path)
         .attr("fill", d => {
           const val = d.properties.poverty;
           return val != null ? colorScale(val) : "#ccc"; // use light gray for missing data
         })
         .attr("stroke", "#fff");
  }).catch(error => {
    console.error("Error loading files:", error);
  });
  


const numericColumns = [
    "poverty_perc",
    "median_household_income",
    "education_less_than_high_school_percent",
    "air_quality",
    "park_access",
    "percent_inactive",
    "percent_smoking",
    "elderly_percentage",
    "number_of_hospitals",
    "number_of_primary_care_physicians",
    "percent_no_heath_insurance",
    "percent_high_blood_pressure",
    "percent_coronary_heart_disease",
    "percent_stroke",
    "percent_high_cholesterol"
  ];
  
  
  let allData = [];
  
  /***************************************
   * 1) LOAD CSV & PARSE
   ***************************************/
  d3.csv("Data/national_health_data_2024.csv").then(function(data) {
    console.log("Loaded data:", data); // debug
  
    // Convert relevant fields to numeric
    data.forEach(d => {
      // For the fixed charts: rename poverty_perc → d.poverty, etc.
      d.poverty = +d.poverty_perc;
      d.bp      = +d.percent_high_blood_pressure;
      d.county  = d.display_name; // for grouped bar
  
      // For the dynamic scatter, parse all columns in numericColumns
      numericColumns.forEach(col => {
        d[col] = +d[col];
      });
    });
  
    // Save to global
    allData = data;
  
   
    createHistogram(data, "poverty", "#histogram1", "Poverty Rate (%)");
    createHistogram(data, "bp",      "#histogram2", "High Blood Pressure (%)");
  
   
    const valid = data.filter(d => d.poverty >= 0 && d.bp >= 0);
    valid.sort((a, b) => b.poverty - a.poverty);
    const top10 = valid.slice(0, 10);
    createGroupedBarChart(top10, "#groupedBar");
  
    
    populateDropdown("#xSelect", numericColumns);
    populateDropdown("#ySelect", numericColumns);
  
    // 2) Set defaults
    d3.select("#xSelect").property("value", "poverty_perc");
    d3.select("#ySelect").property("value", "percent_high_blood_pressure");
  
    // 3) Draw initial
    updateScatter();
  
    // 4) On change
    d3.select("#xSelect").on("change", updateScatter);
    d3.select("#ySelect").on("change", updateScatter);
  });
  
 
  function createHistogram(data, key, svgSelector, title) {
    const svg = d3.select(svgSelector),
          width = +svg.attr("width"),
          height = +svg.attr("height"),
          margin = {top: 20, right: 30, bottom: 30, left: 40};
  
    // X-scale
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d[key])).nice()
      .range([margin.left, width - margin.right]);
  
    // Bins
    const bins = d3.bin()
      .domain(x.domain())
      .thresholds(20)(data.map(d => d[key]));
  
    // Y-scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)]).nice()
      .range([height - margin.bottom, margin.top]);
  
    // Bars
    svg.selectAll(".bar")
      .data(bins)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.x0) + 1)
        .attr("y", d => y(d.length))
        .attr("width", d => x(d.x1) - x(d.x0) - 1)
        .attr("height", d => height - margin.bottom - y(d.length))
        .attr("fill", "steelblue");
  
    // X-axis
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x));
  
    // Y-axis
    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y));
  
    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text(title);
  }
  

  
  // Fill a <select> with options
  function populateDropdown(selector, columns) {
    const dropdown = d3.select(selector);
    dropdown.selectAll("option")
      .data(columns)
      .enter().append("option")
        .attr("value", d => d)
        .text(d => d);
  }
  
  // Called when user changes X or Y dropdown
  function updateScatter() {
    // Which columns are selected?
    const xKey = d3.select("#xSelect").property("value");
    const yKey = d3.select("#ySelect").property("value");
  
    // Clear old chart
    const svg = d3.select("#scatter");
    svg.selectAll("*").remove();
  
    // Dimensions
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const margin = {top: 20, right: 20, bottom: 40, left: 50};
  
    // X-scale
    const xExtent = d3.extent(allData, d => d[xKey]);
    const xScale = d3.scaleLinear()
      .domain(xExtent).nice()
      .range([margin.left, width - margin.right]);
  
    // Y-scale
    const yExtent = d3.extent(allData, d => d[yKey]);
    const yScale = d3.scaleLinear()
      .domain(yExtent).nice()
      .range([height - margin.bottom, margin.top]);
  
    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));
  
    // Points
    svg.selectAll("circle")
      .data(allData)
      .enter().append("circle")
        .attr("cx", d => xScale(d[xKey]))
        .attr("cy", d => yScale(d[yKey]))
        .attr("r", 3)
        .attr("fill", "blue")
        .attr("fill-opacity", 0.6);
  
    // Title (now dynamic)
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      // The user-chosen columns appear in the chart title
      .text(`Scatter: ${xKey} vs. ${yKey}`);
  
    // X-axis label (dynamic)
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .text(xKey);
  
    // Y-axis label (dynamic)
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${margin.left - 35},${height/2}) rotate(-90)`)
      .text(yKey);
  }
  

  function createGroupedBarChart(data, svgSelector) {
    const svg = d3.select(svgSelector),
          width = +svg.attr("width"),
          height = +svg.attr("height"),
          margin = {top: 40, right: 30, bottom: 60, left: 60};
  
    // Two subgroups: "poverty" & "bp"
    const subgroups = ["poverty", "bp"];
  
    // Each county is a group
    const groups = data.map(d => d.county);
  
    // X0: band for county names
    const x0 = d3.scaleBand()
      .domain(groups)
      .range([margin.left, width - margin.right])
      .padding(0.2);
  
   
    const x1 = d3.scaleBand()
      .domain(subgroups)
      .range([0, x0.bandwidth()])
      .padding(0.05);
  
    // Y scale
    const maxVal = d3.max(data, d => Math.max(d.poverty, d.bp));
    const y = d3.scaleLinear()
      .domain([0, maxVal]).nice()
      .range([height - margin.bottom, margin.top]);
  
    // Color
    const color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(["steelblue", "orange"]);
  
    // X-axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");
  
    // Y-axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  
    // Draw bars
    svg.append("g")
      .selectAll("g")
      .data(data)
      .enter().append("g")
        .attr("transform", d => `translate(${x0(d.county)},0)`)
      .selectAll("rect")
      .data(d => subgroups.map(key => ({ key, value: d[key] })))
      .enter().append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => y(0) - y(d.value))
        .attr("fill", d => color(d.key));
  
    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Top 10 Counties: Poverty vs High Blood Pressure");
  
    // X-axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .text("County");
  
    // Y-axis label
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${margin.left - 40},${height/2}) rotate(-90)`)
      .text("Rate (%)");
  
    // Legend
    const legend = svg.selectAll(".legend")
      .data(subgroups)
      .enter().append("g")
        .attr("transform", (d,i) => `translate(${margin.left}, ${margin.top + i*20})`);
  
    legend.append("rect")
      .attr("x", 0)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", d => color(d));
  
    legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .text(d => d === "poverty" ? "Poverty (%)" : "High BP (%)");
  }
  