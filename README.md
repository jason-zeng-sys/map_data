# US Choropleth Map & Dashboard

## 1) Motivation
This project helps users **explore and compare** health and socio-economic indicators across U.S. counties. By combining a **choropleth map** with multiple interactive charts, the application allows users to:
- Visualize how measures such as **poverty**, **income**, or **health factors** etc  vary geographically.
- Examine distributions, correlations, and top values via **histograms**, **scatterplots**, and **grouped bar charts**.
- Interact with **dropdown menus** to select which measures to display in each chart and on the map.

Ultimately, this dashboard can assist in understanding potential relationships between poverty and health outcomes, or highlight which counties exhibit extreme values for certain indicators.

---

## 2) Data
We used data from **`national_health_data_2024.csv`**, a consolidated dataset of county-level attributes, including:

- **Socio-economic** fields (e.g., `poverty_perc`, `median_household_income`, etc.).
- **Health** fields (e.g., `percent_inactive`, `percent_smoking`, `percent_high_blood_pressure`, etc.).
- A **FIPS code** (`cnty_fips`) to identify each county.

We also used a **TopoJSON**  file of U.S. counties. Each county shape has a **`GEOID`** (or `id`) matching the CSV’s FIPS code to attach the data.



---

## 3) Screenshots and interactions.
### 3.1 Charts
The user can select data, and there will be two diagrams, each showing the indivisual trend the two selected data.

![image](https://github.com/user-attachments/assets/3a76a88a-7acb-4c5a-8d6e-c2a6451d4d47)

### 3.2 Realations Charts
the user can also see the relationship chart between the two selected data
![image](https://github.com/user-attachments/assets/0535d8bf-efe4-4312-bba4-794501da8c54)

### 3.3 Map
the suer can also select whichever data in the map dropdown bar and see the overall info about the selectd data
across the USA.

![image](https://github.com/user-attachments/assets/0dad6180-2c97-4e2e-9b7d-b5891ea10f54)

### 3.4 Color Selection
 Throughout the dashboard, we’ve used blue and orange as primary hues for charts, and a blue color scale for the map. Here’s why:

Choropleth Map

I employed a sequential blue color scale (such as d3.schemeBlues[9]) for county coloring.
Reasoning:
Sequential scales are well-suited for numeric data that runs from low to high (like poverty rate or median income).
Blue is a neutral, commonly accepted color for continuous data. It doesn’t carry strong emotional connotations like red/green might.
A multi-step scale (with 9 shades) allows for finer gradations, helping users distinguish small differences in values across counties.
Histograms & Scatterplot

I used steelblue (a moderate blue) for the histogram bars and scatterplot points.
Reasoning:
A single color is enough to highlight the data without overwhelming the user.
Steelblue is a pleasant, subdued shade that contrasts well with white backgrounds and is easily recognized in charts.
Grouped Bar Chart

I use two colors: steelblue for the first measure, orange for the second measure.
Reasoning:
When comparing two bars per county, it’s important to have distinct colors for each subgroup.
Orange pairs well with blue in terms of color contrast (they are often used as complementary colors in data visualization).
This ensures each bar is easily distinguishable, making the chart more readable.


I avoided bright, saturated colors like pure red (rgb(255,0,0)) or neon greens, which can be harsh on the eyes and distract from the data.
By using steelblue, orange, and light-to-dark blues, we maintain a calm, consistent palette that focuses the user on the data values rather than the color intensity.
Color Accessibility



## 4) Visualization Components

### 4.1 Charts (Left Column)
1. **Histogram 1 & 2**  
   Show the distribution of counties for two selected measures (e.g., `poverty_perc` and `percent_high_blood_pressure`).

2. **Scatterplot**  
   Plots any two measures on the X and Y axes to reveal correlations (e.g., does higher poverty correlate with higher smoking?).

3. **Grouped Bar Chart**  
   Displays the top 10 counties by a chosen measure, with sub-bars for two measures. This highlights which counties lead in certain indicators.

### 4.2 Choropleth Map (Right Column)
- **Map**: Each county is colored by a chosen measure (e.g., `poverty_perc`).  
- **Measure Dropdown**: Lets the user pick different attributes (like `median_household_income`, `elderly_percentage`, etc.) to color the map.  
- **Tooltip**: Hovering on a county shows its name (or FIPS) and the measure’s value.

### 4.3 Interactions
- **Dropdowns**:
  - **`#xSelect`** and **`#ySelect`** let you pick measures for the histograms, scatterplot, and grouped bar chart.
  - **`#measureSelect`** picks the map’s color scale measure.
- **Tooltips**:
  - Hovering on the map or chart elements (if implemented) can show detail-on-demand.

---

## 5) Discoveries & Insights
Using this dashboard, you can discover, for example:
- **High-poverty** counties often have higher inactivity or smoking percentages.
- Certain states stand out in **bar charts** for extremely high or low income.
- The **map** highlights geographical patterns, such as clusters of higher inactivity in certain regions.

These observations can guide further analysis or policy focus.

---

## 6) Process & Code Structure

### 6.1 Libraries
- **D3.js (v7)** for data binding, scales, axes, histograms, scatterplots, and path drawing.
- **TopoJSON** for loading county boundaries.
- **HTML/CSS** with a **flexbox** layout for a two-column arrangement (charts on left, map on right).

### 6.2 File Structure
- **`index.html`**: Main page with two flex columns (charts on the left, map on the right).
- **`CSS/styles.css`**: Additional styling.
- **`scripts.js`**: Code for histograms, scatterplot, bar chart, plus chart dropdown logic.
- **`ChoroplethMap.js`**: Code for loading TopoJSON, attaching CSV data to county features, and rendering the map.

### 6.3 How to Run
1. **Clone** or download this repository.
2. **Serve** the project folder via a local server , live server
3. **Open** `index.html` in your browser.
4. **Interact** with the chart dropdowns (`xSelect`, `ySelect`) and the map measure dropdown (`measureSelect`) to see updates.


### 6.4 Links
- **Live Demo** (if deployed):https://map-data-one.vercel.app/

---

## 7) Challenges & Future Work

### 7.1 Challenges
- **Interaction with Map** Currently the map does not allow the user to select spcific counties.
- **Layout**: positioning the layout better overall
- **Time constraints**: limited ability to implement advanced brushing or filtering.

### 7.2 Future Work
- **Brushing** on a histogram or scatterplot to highlight corresponding counties on the map.
- **Time-series**: if the data spanned multiple years, we could add a slider to visualize changes over time.
- **More Interactivity**: advanced tooltips on the histograms, or linking map selections back to charts.

---

## 8) Use of AI & Collaboration
- **AI Tools**: Used ChatGPT for generating code snippets (particularly for flexbox layout and certain D3 patterns) and debugging help. Verified each snippet to ensure correctness.
- **Peer Collaboration**: Received help from classmates for inspiration.



## 9) Demo Video
A **2–3 minute** demo video can be found here: (https://www.youtube.com/watch?v=sttxkalOrMM) 
It demonstrates:
- Changing the chart measures (`xSelect`, `ySelect`) to see histograms, scatterplots, and bar charts update.
- Switching the map measure (`measureSelect`) to recolor counties based on different indicators.
- Observing tooltips on hover to reveal county names and measure values.

---

 
