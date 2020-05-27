async function drawLine() {
  // 1. access data
  const dataset = await d3.csv('../data/mexico-20200519.csv');

  const yAccessor = d => +d.avg_google_7d;
  const dateParser = d3.timeParse('%d-%b-%y');
  const xAccessor = d => dateParser(d.Date);
  const stateAccessor = d => d.State_Name;

  const datasetByState = d3.nest().key(stateAccessor).entries(dataset);
  console.log(datasetByState[0]);

  // 2. create dimensions

  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 400,
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
    .range([dimensions.boundedHeight, 0]);

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth]);

  // 5. draw data

  const lineGenerator = d3
    .line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)));

  bounds
    .selectAll('.line')
    .data(datasetByState)
    .enter()
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', 'lightgrey')
    .attr('stroke-width', 2)
    .attr('d', d => lineGenerator(d.values));

  // 6. draw peripherals
  const yAxisGenerator = d3.axisLeft().scale(yScale);
  const yAxis = bounds.append('g').call(yAxisGenerator);

  const xAxisGenerator = d3
    .axisBottom()
    .scale(xScale)
    // .tickFormat(d3.timeFormat('%Y-%m-%d'));
    .tickFormat(d3.timeFormat('%d %b %Y'));

  const xAxis = bounds
    .append('g')
    .call(xAxisGenerator)
    .style('transform', `translateY(${dimensions.boundedHeight}px)`);

  // 7. act interactivity
}

drawLine();
