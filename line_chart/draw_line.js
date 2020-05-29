// TODO add spanish locale so months show up in spanish
// TODO add 0 baseline
// TODO hide x-baseline
// TODO extend ticks to make grid
// TODO calculate latest day
// TODO calculate rank 1 and rank last from latest day
// TODO activate the colors for rank 1 and rank last
// TODO draw national average
// TODO add sidebar with state check boxes
// TODO toggle line color based on check box

async function drawLine() {
  // 1. access data
  const dataset = await d3.csv('../data/mexico_20200521.csv');

  const yAccessor = d => +d.mobility_index;
  const dateParser = d3.timeParse('%Y-%m-%d');
  const xAccessor = d => dateParser(d.date);
  const stateAccessor = d => d.state_name;
  const stateCodeAccessor = d => d.state_short;
  const dayAccessor = d => d.days;

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
    .attr('stroke', 'lightgrey')
    .attr('stroke-width', 2)
    .attr('d', d => lineGenerator(d.values))
    .attr('class', d => d.values[0].state_short.toLowerCase());

  bounds
    .append('path')
    .attr('class', 'national')
    .attr('fill', 'none')
    .attr('stroke', '#171717')
    .attr('stroke-width', 2)
    .attr('d', () => lineGenerator(country[0].values));

  // 6. draw peripherals
  const yAxisGenerator = d3.axisLeft().scale(yScale);
  const yAxis = bounds.append('g').call(yAxisGenerator);

  const xAxisGenerator = d3
    .axisBottom()
    .scale(xScale)
    .tickFormat(d3.timeFormat('%d %b %Y'));

  const xAxis = bounds
    .append('g')
    .call(xAxisGenerator)
    .style('transform', `translateY(${dimensions.boundedHeight}px)`);

  // 7. act interactivity
}

drawLine();
