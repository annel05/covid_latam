async function ihmeChart({chartKeyword, cutoffDate}) {
  // 0. check for language locale
  setLocale();

  // 1. access data
  // TODO use absolute url from github
  const dataset = await d3.csv(
    `./../data/ihme/Reference_hospitalization_all_locs.csv`
  );

  const replace = dataset.filter(
    d => d.location_name == 'Bolivia (Plurinational State of)'
  );
  replace.forEach(_element => {
    _element.location_name = 'Bolivia';
  });

  // data accessors, shorthand for different columns
  const yAccessor = d => +d.deaths_mean_smoothed;
  const dateParser = d3.timeParse('%Y-%m-%d');
  const xAccessor = d => dateParser(d['date']);
  const countryNameAccessor = d => d.location_name;
  const locationIDAccessor = d => d.location_id;
  const upperProjectionAccessor = d => +d.deaths_upper_smoothed;
  const lowerProjectionAccessor = d => +d.deaths_lower_smoothed;

  // sorting and organizing data
  const countryWatchListIHME = [
    'Mexico',
    'Ecuador',
    'Chile',
    'Argentina',
    'Bolivia',
    'Guyana',
    'Colombia',
    'Brazil',
    'Trinidad and Tobago',
    'Costa Rica',
    'Panama',
    'Nicaragua',
    'Honduras',
    'Paraguay',
    'Suriname',
    'Uruguay',
    'Peru',
    'Cuba',
    'Dominican Republic',
    'Guatemala',
    'Haiti',
    'El Salvador',
  ].sort();

  const countryData = dataset.filter(d =>
    countryWatchListIHME.some(i => countryNameAccessor(d) == i)
  );

  const datasetByCountry = d3
    .nest()
    .key(countryNameAccessor)
    .entries(countryData);

  const cutoffDateDate = dateParser(cutoffDate);

  // 2. create dimensions
  const wrapperElt = `wrapper_${chartKeyword}`;

  let dimensions = {
    width: document.getElementById(wrapperElt).parentElement.clientWidth,
    height: 600,
    margin: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60,
    },
  };
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // 3. draw canvas
  const wrapper = d3
    .select(`#${wrapperElt}`)
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  const bounds = wrapper
    .append('g')
    .style(
      'transform',
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  // 4. create scales

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(countryData, upperProjectionAccessor)])
    .range([dimensions.boundedHeight, 0])
    .nice();

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth]);

  // TODO figure out why colors are showing up as grey??
  const colorScale = d3
    .scaleOrdinal()
    .domain(countryWatchListIHME)
    .range(colorGroup);

  // 5. draw peripherals -- part 1
  const yAxisGenerator = d3
    .axisLeft()
    .scale(yScale)
    .tickSize(-dimensions.boundedWidth);

  const yAxis = bounds.append('g').attr('class', 'y_axis').call(yAxisGenerator);

  const xAxisGenerator = d3
    .axisBottom()
    .scale(xScale)
    .tickSize(-dimensions.boundedHeight)
    .tickFormat(d3.timeFormat('%-d %b'));

  const xAxis = bounds
    .append('g')
    .attr('class', 'x_axis')
    .call(xAxisGenerator)
    .style('transform', `translateY(${dimensions.boundedHeight}px)`);

  const xAxisText = xAxis.selectAll('text').attr('dy', 20);

  const xAxisTicks = xAxis
    .selectAll('.tick line')
    .attr('y1', dimensions.margin.bottom * 0.25);

  // 6. draw data

  // this will generate a line using the x and y Accessor functions
  const lineGenerator = d3
    .line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)));

  const areaGenerator = d3
    .area()
    .x(d => xScale(xAccessor(d)))
    .y0(d => yScale(lowerProjectionAccessor(d)))
    .y1(d => yScale(upperProjectionAccessor(d)));

  countryWatchListIHME.forEach(element => {
    // keep only data for 1 country
    const countrySpecific = datasetByCountry.filter(d => d.key == element);
    if (!countrySpecific[0]) {
      console.log(element);
    }
    const country = countrySpecific[0].values;
    // locationID will be used for classes and ids to select the country since names are messier to work with
    const locationID = locationIDAccessor(country[0]);

    // segment data into real and projection
    const confirmedData = country.filter(d => xAccessor(d) <= cutoffDateDate);
    const projectionData = country.filter(d => xAccessor(d) > cutoffDateDate);

    // draw path for real confirmed/real data
    bounds
      .append('path')
      .attr('fill', 'none')
      .attr('class', `country_${locationID} confirmedData`)
      .attr('id', `country_${locationID}_confirmed`)
      .attr('stroke-width', 1.25)
      .attr('stroke', '#d2d3d4')
      .attr('d', d => lineGenerator(confirmedData));

    // draw path for projection
    bounds
      .append('path')
      .attr('fill', 'none')
      .attr('class', `country_${locationID} projectionData`)
      .attr('id', `country_${locationID}_projection`)
      .attr('stroke-width', 1.25)
      .attr('stroke', '#d2d3d4')
      .attr('stroke-dasharray', '7px 2px')
      .attr('d', d => lineGenerator(projectionData));
  });

  const projectBoundaries = function () {
    // select #cutoffDate_line and remove()
    d3.select('#cutOffDate_line').remove();
    // select #projectionBox and remove()
    d3.select('#projectionBox').remove();
    // draw projectionBox: Rectangle with grey low opacity. X1 is cutoffdate, y1 is top ?. Width is something? xScale.range()[1] - xScale(cutoffDate) and height is dimensions.boundedHeight
    bounds
      .append('rect')
      .attr('id', '#projectionBox')
      .attr('fill', '#eeeeee')
      .attr('opacity', '0.15')
      .attr('x', xScale(cutoffDateDate))
      .attr('y', 0)
      .attr('width', xScale.range()[1] - xScale(cutoffDateDate))
      .attr('height', dimensions.boundedHeight);

    bounds
      .append('line')
      .attr('x1', xScale(cutoffDateDate))
      .attr('x2', xScale(cutoffDateDate))
      .attr('y1', 0)
      .attr('y2', dimensions.boundedHeight)
      .attr('id', 'cutoffDate_line')
      .attr('stroke', 'cornflowerblue');
  };

  projectBoundaries();

  const tooltipLine = bounds.append('line').attr('class', '.tooltipLine_ihme');

  // TODO function for adding active Countries
  const activateCountry = _locationID => {
    // select data from all the rows we already filtered
    const countrySpecific = countryData.filter(
      d => locationIDAccessor(d) == _locationID
    );
    // segment data into real and projection
    const confirmedData = countrySpecific.filter(
      d => xAccessor(d) <= cutoffDateDate
    );
    const projectionData = countrySpecific.filter(
      d => xAccessor(d) > cutoffDateDate
    );
    // draw area
    // TODO look at how I added the class `country_${_locationID}_temp` to area
    bounds
      .append('path')
      .attr('fill', colorScale(countryNameAccessor(countrySpecific[0])))
      .attr('fill-opacity', 0.15)
      .attr('class', `country_${_locationID}_temp`)
      .attr('id', `country_${_locationID}_area`)
      .attr('stroke', 'none')
      .attr('d', areaGenerator(countrySpecific));

    // TODO I also added it to the confirmed and projection lines
    // draw confirmed line
    bounds
      .append('path')
      .attr('fill', 'none')
      .attr('class', `country_${_locationID} country_${_locationID}_temp`)
      .attr('id', `country_${_locationID}_confirmed`)
      .attr('stroke-width', 1.25)
      .attr('stroke', colorScale(countryNameAccessor(countrySpecific[0])))
      .attr('d', d => lineGenerator(confirmedData));
    // draw projection line
    bounds
      .append('path')
      .attr('fill', 'none')
      .attr('class', `country_${_locationID} country_${_locationID}_temp`)
      .attr('id', `country_${_locationID}_projection`)
      .attr('stroke-width', 1.25)
      .attr('stroke', colorScale(countryNameAccessor(countrySpecific[0])))
      .attr('stroke-dasharray', '7px 2px')
      .attr('d', d => lineGenerator(projectionData));

    projectBoundaries();
  };

  activateCountry(98);
  const ownCountries = ['Mexico', 'Brazil', 'Bolivia', 'Chile'];
  const ownCountryIdArray = [];
  ownCountries.forEach(_element => {
    // filter data for that country
    const filtered = countryData.filter(
      d => countryNameAccessor(d) == _element
    );
    // get the locationID for the first row
    const filteredId = locationIDAccessor(filtered[0]);
    // push locationIDs to a new array
    ownCountryIdArray.push(filteredId);
  });

  // 7. act interactivity

  // Toggle Country Lines, part 1 start -- populate country checklist
  const countryList = d3
    .select(`#countryList_${chartKeyword}`)
    .selectAll('input')
    .data(datasetByCountry)
    .enter()
    .append('li')
    .attr('class', d => `country_${locationIDAccessor(d.values[0])}_input`);

  countryList
    .append('input')
    .attr('class', `input_box_${chartKeyword}`)
    .attr('type', 'checkbox')
    .attr(
      'name',
      d => `country_${locationIDAccessor(d.values[0])}_${chartKeyword}`
    );

  countryList
    .append('label')
    .attr('class', `input_label input_label_${chartKeyword}`)
    .attr(
      'for',
      d => `country_${locationIDAccessor(d.values[0])}_${chartKeyword}`
    )
    .html(d => countryNameAccessor(d.values[0]));

  ownCountryIdArray.forEach(_element => {
    activateCountry(_element);
    const countrySelector = `country_${_element}_${chartKeyword}`;
    // TODO find countryName based on location
    const countryName = countryData.filter(d => _element == d.location_id)[0]
      .location_name;
    // checkbox clicked
    d3.select(`[name=${countrySelector}]`).property('checked', true);
    // label active
    d3.select(`[for=${countrySelector}]`)
      .style('color', colorScale(countryName))
      .style('font-weight', 'bold');
  });

  d3.selectAll(`.input_box_${chartKeyword}`).on('input', toggleCountry);

  function toggleCountry() {
    const locationID = this.name.split('_')[1];
    const inputLabel = countryList.select(`[for=${this.name}]`);
    // TODO when you click a country's input box
    if (this.checked) {
      // clicked on
      activateCountry(locationID);
      inputLabel
        .style('color', colorScale(this.name))
        .style('font-weight', 'bold');
    } else {
      // clicked off
      // select the lines & area and remove them
      const linesPlusArea = d3.selectAll(`.country_${locationID}_temp`);
      linesPlusArea.remove();

      // remove style of label
      inputLabel.style('color', '#000').style('font-weight', 'normal');
    }
    // 1. check if the box has been clicked
    // if it has just been clicked: activateCountry and label.
    // if it has been clicked off, remove the line, remove the area, and deactivate the label
  }

  // TODO use labels to toggle country data
}
