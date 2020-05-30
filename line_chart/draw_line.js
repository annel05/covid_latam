// TODO add spanish locale so months show up in spanish
async function drawLine() {
  // 1. access data
  const dataset = await d3.csv('../data/mexico_20200521.csv');

  // data accessors, shorthand for different columns
  const yAccessor = d => +d.mobility_index;
  const dateParser = d3.timeParse('%Y-%m-%d');
  const xAccessor = d => dateParser(d.date);
  const stateAccessor = d => d.state_name;
  const stateCodeAccessor = d => d.state_short;
  const dayAccessor = d => +d.days;
  const metricAccessor = d => +d.ranking_mobility_daily;

  // sorting and organizing data
  const datasetByState = d3.nest().key(stateCodeAccessor).entries(dataset);
  const country = datasetByState.filter(d => d.key == 'Nacional');
  const states = datasetByState.filter(d => d.key !== 'Nacional');

  // 2. create dimensions

  let dimensions = {
    width: window.innerWidth * 0.7,
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
    .select('#wrapper')
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  const bounds = wrapper
    .append('g')
    .style(
      'transform',
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  // init static items
  bounds.append('line').attr('class', 'baseline');

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

  const stateCodes = d3.map(dataset, stateCodeAccessor).keys();
  const stateColors = [
    '#171717',
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

  const test = colorScale.domain()[32];

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
    .attr('stroke', d => colorScale(stateCodeAccessor(d.values[0])))
    .attr('d', d => lineGenerator(d.values))
    .attr('class', d => d.values[0].state_short.toLowerCase() + ' inactive');

  // 6. draw peripherals
  const yAxisGenerator = d3
    .axisLeft()
    .scale(yScale)
    .tickFormat(d => d + '%');

  const yAxis = bounds.append('g').call(yAxisGenerator);

  const xAxisGenerator = d3
    .axisBottom()
    .scale(xScale)
    .tickFormat(d3.timeFormat('%d %b %Y'));

  const xAxis = bounds
    .append('g')
    .call(xAxisGenerator)
    .style('transform', `translateY(${dimensions.boundedHeight}px)`);
  // TODO hide x-baseline
  // TODO extend ticks to make grid

  // add 0-baseline
  bounds
    .select('.baseline')
    .attr('stroke-width', 2)
    .attr('stroke', '#171717')
    .attr('x1', 0)
    .attr('x2', dimensions.boundedWidth)
    .attr('y1', yScale(0))
    .attr('y2', yScale(0));

  // add national average
  bounds
    .append('path')
    .attr('class', 'national')
    .attr('fill', 'none')
    .attr('stroke', colorScale('Nacional'))
    .attr('stroke-dasharray', '5px 2px')
    .attr('stroke-width', 2.5)
    .attr('d', () => lineGenerator(country[0].values));

  // highlight the first and last ranks.
  // 1 - get the latest day
  const latestDay = d3.max(dataset.map(dayAccessor));
  // 2 - filter data to only have this day
  const latestData = dataset.filter(d => dayAccessor(d) == latestDay);
  // 3 - get the rank 1 and rank last states
  const rankOneState = latestData.filter(d => metricAccessor(d) == 1);
  const rankLastState = latestData.filter(
    d => metricAccessor(d) == d3.max(dataset, metricAccessor)
  );
  const rankOne = rankOneState[0]['state_short'].toLowerCase();
  bounds.select(`.${rankOne}`).classed('inactive', false);

  const rankLast = rankLastState[0]['state_short'].toLowerCase();
  bounds.select(`.${rankLast}`).classed('inactive', false);

  // 7. act interactivity

  // TODO add sidebar with state check boxes

  const states_on = d3
    .select('#states_on')
    .selectAll('input')
    .data(states)
    .enter()
    .append('li');
  // .attr('id', d => stateCodeAccessor(d.values[0]).toLowerCase());
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

  states_on.select(`[name=${rankOne}]`).property('checked', true);
  states_on.select(`[name=${rankLast}]`).property('checked', true);

  // TODO toggle line color based on check box
  d3.selectAll('.input_box').on('input', toggleStateLine);
  function toggleStateLine() {
    name = this.name.toLowerCase();
    line = bounds.select(`.${name}`);
    label = states_on.select(`[for=${name}]`);
    console.log(this.name, this.checked);
    if (this.checked) {
      // input box has been checked
      // 1 - turn on state line
      line.classed('inactive', false);
      // 2 - turn on label to match color
    } else {
      // input box has been unchecked
      // 1 - turn off state line
      line.classed('inactive', true);
      // 2 - turn off label to match colors
    }
  }
}

drawLine();
