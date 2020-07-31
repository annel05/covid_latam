async function genericIndex(
  _country,
  _y,
  _ranking,
  _baseline,
  _percentage,
  _keyword
) {
  // This function works with country datasets and takes in the following to create a chart
  // _country: name of country to load data file
  // _y: y-axis variable
  // _ranking: ranking variable for highlighting best and worst for whatever y-axis variable is.
  // _baseline: boolean for drawing a 0 baseline or not.
  // _percentage: boolean for using % symbol in y axis.
  // _keyword: keyword for picking the ids from the document.

  // 0. set language for dates
  setLocale();

  // 1. Get data
  const dataset = await d3.csv(
    `https://raw.githubusercontent.com/lennymartinez/covid_latam/master/data/${_country}_data_latest.csv`
  );

  // set data accessors
  const yAccessor = d => +d[`${_y}`];
  const dateParser = d3.timeParse('%Y-%m-%d');
  const xAccessor = d => dateParser(d.date);
  const stateAccessor = d => d.state_name;
  const stateCodeAccessor = d => d.state_short;
  const dayAccessor = d => +d.days;
  const metricAccessor = d => +d[`${_ranking}`];

  // organize data into country data and state data
  const datasetByStateCode = d3.nest().key(stateCodeAccessor).entries(dataset);
  const national = datasetByStateCode.filter(d => d.key == 'Nacional');
  const states = datasetByStateCode.filter(d => d.key != 'Nacional');

  // 2. create dimensions
  const wrapperElt = `wrapper_${_keyword}`;
  const width = document.getElementById(wrapperElt).parentElement.clientWidth;

  let dimensions = {
    width: width,
    height: 600,
    margin: {top: 15, right: 15, bottom: 40, left: 60},
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
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])
    .nice();

  const statesOnly = dataset.filter(d => stateCodeAccessor(d) != 'Nacional');
  const stateCodes = d3.map(statesOnly, stateCodeAccessor).keys();
  const colorScale = d3.scaleOrdinal().domain(stateCodes).range(colorGroup);

  // 6. draw peripherals -- axes
  const yAxisGenerator = d3
    .axisLeft()
    .scale(yScale)
    .tickSize(-dimensions.boundedWidth);

  // add percentage to tick values if true
  if (_percentage) {
    yAxisGenerator.tickFormat(d => d + '%');
  }

  const yAxis = bounds.append('g').attr('class', 'y_axis').call(yAxisGenerator);

  const xAxisGenerator = d3
    .axisBottom()
    .scale(xScale)
    .tickSize(-dimensions.boundedHeight)
    .tickFormat(d3.timeFormat('%d %b'));

  const xAxis = bounds
    .append('g')
    .attr('class', 'x_axis')
    .call(xAxisGenerator)
    .style('transform', `translateY(${dimensions.boundedHeight}px)`);

  xAxis.selectAll('text').attr('dy', 20);
  xAxis.selectAll('.tick line').attr('y1', dimensions.margin.bottom * 0.25);

  // draw 0-baseline if true
  if (_baseline) {
    bounds
      .append('line')
      .attr('class', 'baseline')
      .attr('stroke-width', 2)
      .attr('stroke', '#333333')
      .attr('x1', 0)
      .attr('x2', dimensions.boundedWidth)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0));
  }

  // 5. draw data

  const lineGenerator = d3
    .line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)));

  bounds
    .selectAll('.state')
    .data(states)
    .enter()
    .append('path')
    .attr('class', d => `state ${d.key}_${_keyword}`)
    .attr('fill', 'none')
    .attr('stroke-width', 1.25)
    .attr('stroke', '#d2d3d4')
    .attr('d', d => lineGenerator(d.values));

  // add national data
  bounds
    .selectAll('.national')
    .data(national)
    .enter()
    .append('path')
    .attr('class', 'national')
    .attr('fill', 'none')
    .attr('stroke', '#333333')
    .attr('stroke-dasharray', '9px 2px')
    .attr('stroke-width', 2.5)
    .attr('d', d => lineGenerator(d.values));

  // Highlight the first and last ranked states for this variable.
  // We do this by first getting the latest day.
  // Then we filter loaded dataset to keep lines where day == latestDay.
  // Then we nest this filtered dataset using the metricAccessor.
  // Rank 1 state will be d.key == 1 and last-ranked state will be d.key == states.length.
  const latestDay = d3.max(dataset.map(dayAccessor));
  const latestData = dataset.filter(d => dayAccessor(d) == latestDay);
  const statesRanked = d3.nest().key(metricAccessor).entries(latestData);
  const bestState = statesRanked.filter(d => d.key == 1);
  const worstState = statesRanked.filter(d => d.key == states.length);
  const bestStateCode = stateCodeAccessor(bestState[0].values[0]);
  const worstStateCode = stateCodeAccessor(worstState[0].values[0]);

  const addStateLine = _stateCode => {
    // This function draws the active version of a state line.
    const specificState = dataset.filter(
      d => stateCodeAccessor(d) == _stateCode
    );

    bounds
      .append('path')
      .attr('id', `${_stateCode}_${_keyword}`)
      .attr('class', `active_${_keyword}`)
      .attr('fill', 'none')
      .attr('stroke', colorScale(_stateCode))
      .attr('stroke-width', 3)
      .attr('d', () => lineGenerator(specificState));
  };

  addStateLine(bestStateCode);
  addStateLine(worstStateCode);

  // 7. add interactivity

  // part 1 start -- populate state checklist

  const stateList = d3
    .select(`#stateList_${_keyword}`)
    .selectAll('input')
    .data(states)
    .enter()
    .append('li')
    .attr('class', d => `${stateCodeAccessor(d.values[0])}_input`);

  stateList
    .append('input')
    .attr('class', `input_box_${_keyword}`)
    .attr('type', 'checkbox')
    .attr('name', d => `${stateCodeAccessor(d.values[0])}_${_keyword}`);

  stateList
    .append('label')
    .attr('class', 'input_label')
    .attr('for', d => `${stateCodeAccessor(d.values[0])}_${_keyword}`)
    .html(d => stateAccessor(d.values[0]));
  // part 1 end

  // part 2 start - turn on the boxes for the state we highlighted earlier.
  [bestStateCode, worstStateCode].forEach(element => {
    const inputBox = stateList.select(`[name=${element}_${_keyword}]`);
    const inputLabel = stateList.select(`[for=${element}_${_keyword}]`);

    inputBox.property('checked', true);
    inputLabel.style('color', colorScale(element)).style('font-weight', 'bold');
  });
  // part 2 end

  // part 3 start - toggle on/off any state by checking the corresponding input box.
  d3.selectAll(`.input_box_${_keyword}`).on('input', toggleStateLine);

  function toggleStateLine() {
    const stateCode = this.name.split('_')[0];
    const inputLabel = stateList.select(`[for=${this.name}]`);

    if (this.checked) {
      // input box has become active. Draw the color line and have the inputLabel match.
      addStateLine(stateCode);
      inputLabel
        .style('color', colorScale(stateCode))
        .style('font-weight', 'bold');
    } else {
      // input box has become inactive. Remove the color line and the inputLabel styles.
      const line = bounds.select(`#${stateCode}_${_keyword}`);
      line.remove();
      inputLabel.style('color', '#000').style('font-weight', 'normal');
    }
  }
}
