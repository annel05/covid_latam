async function ihmeChart() {
  // 0. check for language locale
  setLocale();

  // 1. access data
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
  countryWatchList = [
    'Mexico',
    'Brazil',
    'Chile',
    'Colombia',
    'Dominican Republic',
    'Argentina',
    'Bolivia',
  ].sort();

  const countryData = dataset.filter(d =>
    countryWatchList.some(i => countryNameAccessor(d) == i)
  );

  const datasetByCountry = d3
    .nest()
    .key(countryNameAccessor)
    .entries(countryData);

  const cutoffString = '2020-07-18';
  const cutoffDate = dateParser(cutoffString);

  // 2. create dimensions

  let dimensions = {
    width: document.getElementById('wrapper_policy_main').parentElement
      .clientWidth,
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
    .select('#wrapper_policy_main')
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

  const colorScale = d3
    .scaleOrdinal()
    .domain(countryWatchList)
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

  countryWatchList.forEach(element => {
    // keep only data for 1 country
    const countrySpecific = datasetByCountry.filter(d => d.key == element);
    const country = countrySpecific[0].values;
    // locationID will be used for classes and ids to select the country since names are messier to work with
    const locationID = locationIDAccessor(country[0]);

    // segment data into real and projection
    const confirmedData = country.filter(d => xAccessor(d) <= cutoffDate);
    const projectionData = country.filter(d => xAccessor(d) > cutoffDate);

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
      .attr('x', xScale(cutoffDate))
      .attr('y', 0)
      .attr('width', xScale.range()[1] - xScale(cutoffDate))
      .attr('height', dimensions.boundedHeight);

    bounds
      .append('line')
      .attr('x1', xScale(cutoffDate))
      .attr('x2', xScale(cutoffDate))
      .attr('y1', 0)
      .attr('y2', dimensions.boundedHeight)
      .attr('id', 'cutoffDate_line')
      .attr('stroke', 'cornflowerblue');
  };

  projectBoundaries();

  const tooltipLine = bounds
    .append('line')
    .attr('class', '.tooltipLine_policy');

  // TODO function for adding active Countries
  const activateCountry = _locationID => {
    // select data from all the rows we already filtered
    const countrySpecific = countryData.filter(
      d => locationIDAccessor(d) == _locationID
    );
    // segment data into real and projection
    const confirmedData = countrySpecific.filter(
      d => xAccessor(d) <= cutoffDate
    );
    const projectionData = countrySpecific.filter(
      d => xAccessor(d) > cutoffDate
    );
    // draw area
    bounds
      .append('path')
      .attr('fill', colorScale(countryNameAccessor(countrySpecific[0])))
      .attr('fill-opacity', 0.15)
      .attr('stroke', 'none')
      .attr('d', areaGenerator(countrySpecific));
    // draw confirmed line
    bounds
      .append('path')
      .attr('fill', 'none')
      .attr('class', `country_${_locationID} confirmedData`)
      .attr('id', `country_${_locationID}_confirmed`)
      .attr('stroke-width', 1.25)
      .attr('stroke', colorScale(countryNameAccessor(countrySpecific[0])))
      .attr('d', d => lineGenerator(confirmedData));
    // draw projection line
    bounds
      .append('path')
      .attr('fill', 'none')
      .attr('class', `country_${_locationID} projectionData`)
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

  // const state_list = d3
  // .select('#state_list_policy')
  // .selectAll('input')
  // .data(states)
  // .enter()
  // .append('li')
  // .attr('class', d => `${stateCodeAccessor(d.values[0])}_input`);

  // state_list
  // .append('input')
  // .attr('class', 'input_box_policy')
  // .attr('type', 'checkbox')
  // .attr('name', d => `${stateCodeAccessor(d.values[0])}_policy`);

  // state_list
  // .append('label')
  // .attr('class', 'input_label')
  // .attr('for', d => `${stateCodeAccessor(d.values[0])}_policy`)
  // .html(d => stateAccessor(d.values[0]));

  ownCountryIdArray.forEach(_element => {
    activateCountry(_element);
    // TODO future -- checkbox clicked
    // TODO future -- label active
  });

  // state_list.select(`[name=${firstRankCode}_policy]`).property('checked', true);
  // state_list
  // .select(`[for=${firstRankCode}_policy]`)
  // .style('color', colorScale(firstRankCode))
  // .style('font-weight', 'bold');

  // state_list.select(`[name=${lastRankCode}_policy]`).property('checked', true);
  // state_list
  // .select(`[for=${lastRankCode}_policy]`)
  // .style('color', colorScale(lastRankCode))
  // .style('font-weight', 'bold');

  // d3.selectAll('.input_box_policy').on('input', toggleStateLine);

  // function toggleStateLine() {
  // const code = this.name.split('_')[0];
  // const label = state_list.select(`[for=${this.name}]`);
  // if (this.checked) {
  // // input box has been checked
  // // 1 - turn on state line
  // addStateLine(code);
  // // 2 - turn on label to match color
  // label.style('color', colorScale(code)).style('font-weight', 'bold');
  // } else {
  // // input box has been unchecked
  // // 1 - turn off state line
  // bounds.select(`.${code}_temp_policy`).remove();
  // label.style('color', '#000').style('font-weight', 'normal');
  // // 2 - turn off label to match colors
  // }
  // }
  // const tooltipDate = bounds
  // .append('text')
  // .attr('class', 'tooltipDate_policy')
  // .style('opacity', 0);
  // // tooltip interactivity:
  // listeningRect.on('mousemove', onMouseMove).on('mouseleave', onMouseLeave);

  // const tooltip = d3
  // .select('#tooltip_policy')
  // .style('opacity', 0)
  // .style('top', `${dimensions.margin.top * 2}px`)
  // .style('left', `${dimensions.margin.left * 1.25}px`);
  // const tooltipHeader = tooltip.select('#tooltipHeader_policy');
  // const tooltipContent = tooltip.select('#tooltipContent_policy');
  // let activeStates;

  // function onMouseMove() {
  // tooltip.style('opacity', 1);
  // // Translate mouse position into a date and y-value
  // const mousePosition = d3.mouse(this);
  // const hoveredDate = xScale.invert(mousePosition[0]);

  // const getDistanceFromHoveredDate = d =>
  // Math.abs(xAccessor(d) - hoveredDate);

  // const closestIndex = d3.scan(
  // dataset,
  // (a, b) => getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
  // );
  // const closestDate = dataset[closestIndex];

  // const data = states.filter(d => d.date == closestDate.date);
  // const closestXValue = xAccessor(closestDate);
  // const closestYValue = yAccessor(closestDate);

  // activeStates = ['Nacional'];
  // // get a list of all the active states
  // const allActive = document
  // .getElementById('wrapper_policy_main')
  // .getElementsByClassName('active_policy');

  // Array.from(allActive).forEach(element => {
  // code = element.getAttribute('class').split('_')[0];
  // activeStates.push(code);
  // });

  // // clear the tooltip box
  // tooltipHeader.selectAll('*').remove();
  // tooltipContent.selectAll('*').remove();
  // d3.selectAll('.temp_circle_policy').remove();

  // const displayFormat = d3.timeFormat('%d %B');

  // // Update tooltipDate with current date:
  // tooltipDate
  // .attr('x', xScale(closestXValue) + 15)
  // .attr('y', mousePosition[1])
  // .text(displayFormat(dateParser(closestDate.date)))
  // .attr('font-weight', 700)
  // .style('opacity', 1);
  // // Add date to tooltip
  // tooltipHeader
  // .append('span')
  // .html(displayFormat(dateParser(closestDate.date)));

  // tooltipLine
  // .attr('x1', xScale(closestXValue))
  // .attr('x2', xScale(closestXValue))
  // .attr('y1', 0)
  // .attr('y2', dimensions.boundedHeight)
  // .attr('stroke-width', 2)
  // .attr('stroke-dasharray', '7px 2px')
  // .attr('stroke', '#000')
  // .style('opacity', 1);

  // // add value for each active state to the tooltip
  // activeStates.forEach(element => {
  // // filter for the state's data on that day.
  // const point = dataset
  // .filter(d => d.state_short == element)
  // .filter(d => d.date == closestDate.date);

  // const yValue = yAccessor(point[0]);
  // const xValue = xAccessor(point[0]);
  // const stateName = stateCodeAccessor(point[0]);
  // const getColor = _code => {
  // if (_code == 'Nacional') {
  // return '#171717';
  // } else {
  // return colorScale(stateName);
  // }
  // };
  // const pointInfo = tooltipContent
  // .append('tr')
  // .attr('class', 'tooltip_state');
  // pointInfo
  // .append('td')
  // .attr('class', 'tooltip_state_name')
  // .html(point[0].state_name)
  // .style('color', getColor(element));
  // pointInfo
  // .append('td')
  // .attr('class', 'tooltip_value')
  // .html(yValue.toFixed(1));

  // // add a dot for each state
  // bounds
  // .append('circle')
  // .attr('cx', xScale(xValue))
  // .attr('cy', yScale(yValue))
  // .attr('r', 7)
  // .attr('fill', getColor(element))
  // .attr('class', 'temp_circle_policy');
  // });

  // //
  // }

  // function onMouseLeave() {
  // activeStates = ['Nacional'];
  // tooltip.style('opacity', 0);
  // tooltipLine.style('opacity', 0);
  // bounds.selectAll('.temp_circle_policy').remove();
  // tooltipDate.style('opacity', 0);
  // }

  // d3.selectAll('.states').on('click', toggleStateLineManually);
  // d3.selectAll('.active_policy').on('click', toggleStateLineManually);
  // function toggleStateLineManually() {
  // const ourClass = this.classList[0];
  // const code = ourClass.split('_')[0];
  // // find the input box associated with this line
  // const inputBox = d3.select(`[name=${code}_policy`);
  // const isActive = inputBox._groups[0][0].checked;
  // const label = d3.select(`[for=${code}_policy]`);
  // if (isActive) {
  // // remove the state line, turn off the label, and uncheck the box
  // } else {
  // // draw the state line, turn on the label, and check the box
  // addStateLine(code);
  // label.style('color', colorScale(code)).style('font-weight', 'bold');
  // inputBox.property('checked', true);
  // }
  // }
}
ihmeChart();
