class ChoroplethMap {
  constructor(_config, _data, _defaultMeasure) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 800,
      containerHeight: _config.containerHeight || 600,
      margin: _config.margin || { top: 20, right: 20, bottom: 20, left: 20 },
      tooltipPadding: _config.tooltipPadding || 10,
      legendBottom: _config.legendBottom || 50,
      legendLeft: _config.legendLeft || 50,
      legendRectHeight: _config.legendRectHeight || 12,
      legendRectWidth: _config.legendRectWidth || 150
    };
    this.data = _data;         // The full TopoJSON
    this.measure = _defaultMeasure; // e.g. "poverty" or "poverty_perc"
    this.initVis();
  }
  
  initVis() {
    let vis = this;
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
    
    vis.svg = d3.select(vis.config.parentElement).append('svg')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);
    
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Use Albers USA for a better U.S. map projection
    vis.projection = d3.geoAlbersUsa();
    vis.geoPath = d3.geoPath().projection(vis.projection);
    
    // A color scale we'll update based on the chosen measure's domain
    vis.colorScale = d3.scaleLinear()
      .range(['#cfe2f2', '#0d306b'])
      .interpolate(d3.interpolateHcl);
    
    // Define a linearGradient for the legend
    vis.linearGradient = vis.svg.append('defs').append('linearGradient')
      .attr("id", "legend-gradient");
    
    // Legend group
    vis.legend = vis.chart.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${vis.config.legendLeft},${vis.height - vis.config.legendBottom})`);
    
    vis.legendRect = vis.legend.append('rect')
      .attr('width', vis.config.legendRectWidth)
      .attr('height', vis.config.legendRectHeight);
    
    vis.legendTitle = vis.legend.append('text')
      .attr('class', 'legend-title')
      .attr('dy', '.35em')
      .attr('y', -10)
      .text('Measure'); // We'll update the text to reflect measure if you want
    
    // Start the visualization
    vis.updateVis();
  }
  
  // Called whenever we change the measure or want to re-calc color domain
  updateVis() {
    let vis = this;

  
    const countiesGeo = topojson.feature(vis.data, vis.data.objects.counties);


    const measureExtent = d3.extent(countiesGeo.features, d => d.properties[vis.measure]);
    // In case some measure is missing or invalid, we fallback to [0,1]
    if (!measureExtent || !isFinite(measureExtent[0])) {
      // fallback
      vis.colorScale.domain([0, 1]);
      vis.legendStops = [
        { color: '#cfe2f2', value: 0, offset: 0 },
        { color: '#0d306b', value: 1, offset: 100 }
      ];
    } else {
      vis.colorScale.domain(measureExtent);
      vis.legendStops = [
        { color: '#cfe2f2', value: measureExtent[0], offset: 0 },
        { color: '#0d306b', value: measureExtent[1], offset: 100 }
      ];
    }

    vis.legendTitle.text(vis.measure);

    vis.renderVis();
  }
  
  renderVis() {
    let vis = this;
    // Convert again for drawing
    const countiesGeo = topojson.feature(vis.data, vis.data.objects.counties);

    // Fit the projection
    vis.projection.fitSize([vis.width, vis.height], countiesGeo);
    
    const countryPaths = vis.chart.selectAll('.country')
      .data(countiesGeo.features)
      .join('path')
        .attr('class', 'country')
        .attr('d', vis.geoPath)
        .attr('fill', d => {
          const val = d.properties[vis.measure];
          return (val != null && isFinite(val)) ? vis.colorScale(val) : '#ccc';
        })
        .attr('stroke', '#fff');
    
    countryPaths
      .on('mousemove', (event, d) => {
        // Fallback to NAME or id or "Unknown"
        const countyName = d.properties.NAME || d.id || "Unknown";
        const val = d.properties[vis.measure];
        const valStr = (val != null && isFinite(val)) ? `${val}` : "N/A";
        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
          .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
          .html(`
            <div class="tooltip-title">${countyName}</div>
            <div><strong>${vis.measure}:</strong> ${valStr}</div>
          `);
      })
      .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
      });
    
    // Update legend stops
    vis.legend.selectAll('.legend-label')
      .data(vis.legendStops)
      .join('text')
        .attr('class', 'legend-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('y', 20)
        .attr('x', (d, i) => i === 0 ? 0 : vis.config.legendRectWidth)
        .text(d => Math.round(d.value * 10) / 10);

    vis.linearGradient.selectAll('stop')
      .data(vis.legendStops)
      .join('stop')
        .attr('offset', d => d.offset + '%')
        .attr('stop-color', d => d.color);

    vis.legendRect.attr('fill', 'url(#legend-gradient)');
  }

  // A new method: update which measure we color by
  updateMeasure(newMeasure) {
    this.measure = newMeasure;
    this.updateVis();
  }
}



Promise.all([
  d3.json("Data/map.json"),                // U.S. counties TopoJSON
  d3.csv("Data/national_health_data_2024.csv")
]).then(([topoData, csvData]) => {
  console.log("TopoJSON data:", topoData);
  console.log("TopoJSON objects:", topoData.objects);


const numericColumns = [
  "poverty",                              // from poverty_perc
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


// 1) Parse CSV
csvData.forEach(d => {
  // Pad FIPS
  d.cnty_fips = d.cnty_fips.padStart(5, '0');

  // Convert your numeric columns
  numericColumns.forEach(col => {
    if (col === "poverty") {
      // If your CSV has "poverty_perc", store it in d.poverty
      d.poverty = +d.poverty_perc;

    } else if (col === "median_household_income") {
      d.median_household_income = +d.median_household_income;

    } else if (col === "education_less_than_high_school_percent") {
      d.education_less_than_high_school_percent = +d.education_less_than_high_school_percent;

    } else if (col === "air_quality") {
      d.air_quality = +d.air_quality;

    } else if (col === "park_access") {
      d.park_access = +d.park_access;

    } else if (col === "percent_inactive") {
      d.percent_inactive = +d.percent_inactive;

    } else if (col === "percent_smoking") {
      d.percent_smoking = +d.percent_smoking;

    } else if (col === "elderly_percentage") {
      d.elderly_percentage = +d.elderly_percentage;

    } else if (col === "number_of_hospitals") {
      d.number_of_hospitals = +d.number_of_hospitals;

    } else if (col === "number_of_primary_care_physicians") {
      d.number_of_primary_care_physicians = +d.number_of_primary_care_physicians;

    } else if (col === "percent_no_heath_insurance") {
      d.percent_no_heath_insurance = +d.percent_no_heath_insurance;

    } else if (col === "percent_high_blood_pressure") {
      d.percent_high_blood_pressure = +d.percent_high_blood_pressure;

    } else if (col === "percent_coronary_heart_disease") {
      d.percent_coronary_heart_disease = +d.percent_coronary_heart_disease;

    } else if (col === "percent_stroke") {
      d.percent_stroke = +d.percent_stroke;

    } else if (col === "percent_high_cholesterol") {
      d.percent_high_cholesterol = +d.percent_high_cholesterol;
    }
  });
});

  // 2) Build a lookup by FIPS
  const dataByFips = {};
  csvData.forEach(d => {
    dataByFips[d.cnty_fips] = d;
  });


 topoData.objects.counties.geometries.forEach(geom => {
  const fips = geom.properties.GEOID || geom.id;
  const row = dataByFips[fips];
  if (row) {
    // Attach numeric columns
    geom.properties.poverty = row.poverty;
    geom.properties.median_household_income = row.median_household_income;
    geom.properties.percent_inactive = row.percent_inactive;
    geom.properties.percent_smoking = row.percent_smoking;
    geom.properties.elderly_percentage = row.elderly_percentage;
    geom.properties.park_access = row.park_access;
    geom.properties.education_less_than_high_school_percent = row.education_less_than_high_school_percent;
    
    // NEW: Attach the missing attributes
    geom.properties.air_quality = row.air_quality;
    geom.properties.percent_no_heath_insurance = row.percent_no_heath_insurance;
    geom.properties.number_of_hospitals = row.number_of_hospitals;
    geom.properties.number_of_primary_care_physicians = row.number_of_primary_care_physicians;
    geom.properties.percent_high_blood_pressure = row.percent_high_blood_pressure;
    geom.properties.percent_coronary_heart_disease = row.percent_coronary_heart_disease;
    geom.properties.percent_stroke = row.percent_stroke;
    geom.properties.percent_high_cholesterol = row.percent_high_cholesterol;

    // Attach name
    geom.properties.NAME = row.display_name; 
  } else {
    // If no match, set them to null
    geom.properties.poverty = null;
    geom.properties.median_household_income = null;
    geom.properties.percent_inactive = null;
    geom.properties.percent_smoking = null;
    geom.properties.elderly_percentage = null;
    geom.properties.park_access = null;
    geom.properties.education_less_than_high_school_percent = null;
    
    // NEW: Set the missing attributes to null
    geom.properties.air_quality = null;
    geom.properties.percent_no_heath_insurance = null;
    geom.properties.number_of_hospitals = null;
    geom.properties.number_of_primary_care_physicians = null;
    geom.properties.percent_high_blood_pressure = null;
    geom.properties.percent_coronary_heart_disease = null;
    geom.properties.percent_stroke = null;
    geom.properties.percent_high_cholesterol = null;

    geom.properties.NAME = null;
  }
});



  const config = {
    parentElement: "#map",
    containerWidth: 800,
    containerHeight: 600,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    tooltipPadding: 10,
    legendBottom: 50,
    legendLeft: 50,
    legendRectHeight: 12,
    legendRectWidth: 150
  };
  const defaultMeasure = "poverty"; // pick your default measure
  const choroplethMap = new ChoroplethMap(config, topoData, defaultMeasure);


  const measureDropdown = d3.select("#measureSelect");
  measureDropdown.selectAll("option")
    .data(numericColumns)
    .enter().append("option")
      .attr("value", d => d)
      .text(d => d);

  measureDropdown.on("change", function() {
    const newMeasure = d3.select(this).property("value");
    // Tell the map to update the measure
    choroplethMap.updateMeasure(newMeasure);
  });

}).catch(error => {
  console.error("Error loading files:", error);
});
