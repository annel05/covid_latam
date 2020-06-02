async function drawPolicy() {
  // 0. check for language locale
  const lang = d3.select('html').property('lang');
  if (lang == 'es-ES') {
    d3.timeFormatDefaultLocale(es_locale);
  }
  if (lang == 'pt-br') {
    d3.timeFormatDefaultLocale(pt_locale);
  }
  // 1. access data
  const dataset_all = await d3.csv(
    'https://raw.githubusercontent.com/lennymartinez/covid_latam/master/data/data_20200521.csv'
  );
  const dataset = dataset_all.filter(d => d.country == 'Brasil');

  // data accessors, shorthand for different columns
  const yAccessor = d => +d.policy_index;
  const dateParser = d3.timeParse('%Y-%m-%d');
  const xAccessor = d => dateParser(d.date);
  const stateAccessor = d => d.state_name;
  const stateCodeAccessor = d => d.state_short;
  const dayAccessor = d => +d.days;
  const metricAccessor = d => +d.ranking_policy_daily;

  // sorting and organizing data
  const datasetByState = d3.nest().key(stateCodeAccessor).entries(dataset);
  const country = datasetByState.filter(d => d.key == 'Nacional');
  const states = datasetByState.filter(d => d.key !== 'Nacional');

  // 2. create dimensions

  const width = document.getElementById('chart_wrapper_policy').parentElement
    .clientWidth;
  let dimensions = {
    width: width,
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
    .select('#chart_wrapper_policy')
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
    .range([0, dimensions.boundedWidth]);

  const statesData = dataset.filter(d => d.state_short !== 'Nacional');
  const stateCodes = d3.map(statesData, stateCodeAccessor).keys();
  const stateColors = [
    '#4A72B8',
    '#ED7D30',
    '#A5A5A5',
    '#FDC010',
    '#5D9BD3',
    '#71AD46',
    '#264579',
    '#9E4B23',
    '#646464',
    '#98752B',
    '#255F92',
    '#446931',
    '#6C8EC9',
    '#F2975B',
    '#939697',
    '#FFCF34',
    '#7DAFDD',
    '#8DC268',
    '#3A5829',
    '#ED7D30',
    '#848484',
    '#CA9A2C',
    '#347EC1',
    '#C55C28',
    '#91ABD9',
    '#F3B183',
    '#8A8F90',
    '#FFDA68',
    '#9DC3E5',
    '#AAD18D',
    '#213964',
    '#4A72B8',
  ];
  const colorScale = d3.scaleOrdinal().domain(stateCodes).range(stateColors);

  // 6. draw peripherals -- part 1
  const yAxisGenerator = d3
    .axisLeft()
    .scale(yScale)
    .tickSize(-dimensions.boundedWidth);

  const yAxis = bounds.append('g').attr('class', 'y_axis').call(yAxisGenerator);

  const xAxisGenerator = d3
    .axisBottom()
    .scale(xScale)
    .tickSize(-dimensions.boundedHeight)
    .tickFormat(d3.timeFormat('%d %B'));

  const xAxis = bounds
    .append('g')
    .attr('class', 'x_axis')
    .call(xAxisGenerator)
    .style('transform', `translateY(${dimensions.boundedHeight}px)`);

  const xAxisText = xAxis.selectAll('text').attr('dy', 20);

  const xAxisTicks = xAxis
    .selectAll('.tick line')
    .attr('y1', dimensions.margin.bottom * 0.25);

  // 5. draw data

  // this will generate a line using the x and y Accessor functions
  const lineGenerator = d3
    .line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)));

  // this part generates all the grey lines for all the states
  bounds
    .selectAll('.states')
    .data(states)
    .enter()
    .append('path')
    .attr('fill', 'none')
    .attr('stroke-width', 2.5)
    .attr('stroke', '#d2d3d4')
    .attr('d', d => lineGenerator(d.values))
    .attr('class', d => d.values[0].state_short);

  // add national average
  bounds
    .append('path')
    .attr('class', 'national')
    .attr('fill', 'none')
    .attr('stroke', '#171717')
    .attr('stroke-dasharray', '5px 2px')
    .attr('stroke-width', 2.5)
    .attr('d', () => lineGenerator(country[0].values));

  // highlight the first and last ranks.
  // 1 - get the latest day
  const latestDay = d3.max(dataset.map(dayAccessor));
  // 2 - filter data to only have this day
  const latestData = dataset.filter(d => dayAccessor(d) == latestDay);
  // 3 - get the rank 1 state
  const firstRankState = latestData.filter(d => metricAccessor(d) == 1);
  const firstRankCode = firstRankState[0].state_short;
  // 4 - get the last rank state
  const lastRankState = latestData.filter(
    d => metricAccessor(d) == d3.max(latestData, metricAccessor)
  );
  const lastRankCode = lastRankState[0].state_short;

  // This function draws the temporary state line given a state code.
  const addStateLine = _stateCode => {
    const stateData = dataset.filter(d => stateCodeAccessor(d) == _stateCode);

    bounds
      .append('path')
      .attr('class', `${_stateCode}_temp`)
      .attr('fill', 'none')
      .attr('stroke', colorScale(_stateCode))
      .attr('stroke-width', 3)
      .attr('d', () => lineGenerator(stateData));
  };

  addStateLine(firstRankCode);
  addStateLine(lastRankCode);

  // 7. act interactivity

  const states_on = d3
    .select('#states_on')
    .selectAll('input')
    .data(states)
    .enter()
    .append('li')
    .attr('class', d => `${stateCodeAccessor(d.values[0])}_state off`);
  states_on
    .append('input')
    .attr('class', 'input_box')
    .attr('type', 'checkbox')
    .attr('name', d => stateCodeAccessor(d.values[0]));
  states_on
    .append('label')
    .attr('class', 'input_label')
    .attr('for', d => stateCodeAccessor(d.values[0]))
    .html(d => stateAccessor(d.values[0]));

  states_on.select(`[name=${firstRankCode}]`).property('checked', true);
  states_on
    .select(`[for=${firstRankCode}]`)
    .style('color', colorScale(firstRankCode))
    .style('font-weight', 'bold');

  states_on.select(`[name=${lastRankCode}]`).property('checked', true);
  states_on
    .select(`[for=${lastRankCode}]`)
    .style('color', colorScale(lastRankCode))
    .style('font-weight', 'bold');

  d3.selectAll('.input_box').on('input', toggleStateLine);
  function toggleStateLine() {
    label = states_on.select(`[for=${this.name}]`);
    if (this.checked) {
      // input box has been checked
      // 1 - turn on state line
      addStateLine(this.name);
      // 2 - turn on label to match color
      label.style('color', colorScale(this.name)).style('font-weight', 'bold');
    } else {
      // input box has been unchecked
      // 1 - turn off state line
      bounds.select(`.${this.name}_temp`).remove();
      label.style('color', '#000').style('font-weight', 'normal');
      // 2 - turn off label to match colors
    }
  }
}

drawPolicy();
