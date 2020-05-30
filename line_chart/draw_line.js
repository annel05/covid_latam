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
    width: window.innerWidth * 0.9,
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

  // TODO add color scale based on state colors
  const stateCodes = dataset.map(stateCodeAccessor);
  const stateColors = [];
  const colorScale = d3.scaleLinear().domain(stateCodes).range(stateColors);
  console.log(stateCodes);
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
    .attr('stroke-width', 1)
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
    .attr('stroke', '#171717')
    .attr('stroke-dasharray', '5px 2px')
    .attr('stroke-width', 1)
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
  const rankOne = rankLastState[0]['state_short'].toLowerCase();
  // TODO activate the colors for rank 1 and rank last

  // 7. act interactivity
  // TODO add sidebar with state check boxes
  // TODO toggle line color based on check box
}

drawLine();
